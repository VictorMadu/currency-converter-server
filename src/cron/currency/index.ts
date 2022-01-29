import { CronJob } from "cron";
import axios, { AxiosResponse } from "axios";
import fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import { getConfig } from "../../config";
import * as _ from "lodash";
import dbServicePlugin, { getDbService } from "./db-service";
import DbService from "./db-service/_service";
import { AggregationCursor, ObjectId } from "mongodb";
import { ITriggeredAlertDocument } from "./db-service/_dtypes";
import wsEventEmitter from "../../ws/event-emitter";

const currencyCronPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);

  const apiKeys = _.get(
    getConfig(fastify),
    "currency_rate_api_keys"
  ) as string[];

  const apiKeysLength = apiKeys.length;
  let currApiKeyIndex = -1;

  const job = new CronJob("20 * * * * *", async () => {
    currApiKeyIndex = (currApiKeyIndex + 1) % apiKeysLength;
    fastify.log.info(
      "Started currency cron job and uaing api key of index",
      currApiKeyIndex
    );

    let data:
      | {
          success: boolean;
          base: string;
          timestamp: number;
          date: string;
          rates: Record<string, number>;
        }
      | Error;
    try {
      data = await getNewCurrencyRates(apiKeys[currApiKeyIndex]);
    } catch (error) {
      return fastify.log.error({
        type: "getting new currency rates error",
        error,
      });
    }
    if (data instanceof Error) return fastify.log.error(data.message);

    await updateAllCurrencyRate(fastify, data);
    await updateMetaData(fastify, data);
    notifyPriceUpdate();

    const cursor = await getDbService(fastify).getAlertsToTrigger({
      currTime: new Date(data.timestamp * 1000),
    });
    await notifyUsersAndPushToTriggered(cursor, fastify);
  });

  fastify.addHook("onClose", () => {
    job.stop();
  });

  fastify.addHook("onReady", () => {
    job.start();
    console.log("Next getNewCurrencyRates cron job is " + job.nextDate());
    fastify.log.info("Next getNewCurrencyRates cron job is " + job.nextDate());
  });
};

const updateMetaData = async (
  fastify: FastifyInstance,
  data: {
    base: string;
    timestamp: number;
  }
) => {
  const success = await getDbService(fastify).updateCurrencyMetaData({
    base: data.base,
    timestamp: new Date(data.timestamp * 1000),
  });

  if (!success)
    fastify.log.warn({
      msg: "Updating of currency MetaData failed",
      payload: data,
    });
};

const notifyUsersAndPushToTriggered = async (
  cursor: AggregationCursor<ITriggeredAlertDocument>,
  fastify: FastifyInstance
) => {
  let triggeredAlert: ITriggeredAlertDocument | null;
  while ((triggeredAlert = await cursor.next())) {
    console.log("\n\n\nNext pending alert to trigger", triggeredAlert);
    notifyUser(
      {
        alertId: triggeredAlert._id,
        user: triggeredAlert.user,
        base: triggeredAlert.base,
        quota: triggeredAlert.quota,
        targetRate: triggeredAlert.target_ratio,
        triggeredRate: triggeredAlert.triggered_ratio,
        triggeredTime: triggeredAlert.triggered_time,
      },
      fastify
    );
    // TODO: Use Promise.all or allSettled to run them all together
    await pushToTriggered(triggeredAlert, fastify);
  }
};

const pushToTriggered = async (
  triggeredAlert: ITriggeredAlertDocument,
  fastify: FastifyInstance
) => {
  return await getDbService(fastify).pushReachedAlertToTriggered(
    triggeredAlert
  );
};

const notifyUser = async (
  payload: {
    user: {
      id: ObjectId;
      email: string;
      phone: string;
      notification_medium: ("app" | "phone" | "email")[];
    };
    alertId: ObjectId;
    base: string;
    quota: string;
    targetRate: number;
    triggeredRate: number;
    triggeredTime: Date;
  },
  fastify: FastifyInstance
) => {
  const notificationActions = {
    app: notifyApp,
    email: notifyEmail,
    phone: notifyPhone,
  };

  const msg = getMessage({
    base: payload.base,
    quota: payload.quota,
    targetRate: payload.targetRate,
    triggeredRate: payload.triggeredRate,
  });

  _.map(payload.user.notification_medium, (medium) =>
    notificationActions[medium]({
      alertId: payload.alertId,
      userId: payload.user.id,
      msg,
      base: payload.base,
      quota: payload.quota,
      triggeredTime: payload.triggeredTime,
    })
  );
};

const getMessage = (payload: {
  base: string;
  quota: string;
  targetRate: number;
  triggeredRate: number;
}) => {
  let messageBuilder = `${payload.base}/${payload.quota} `;
  if (payload.targetRate > payload.triggeredRate)
    return messageBuilder + `has gone below ${payload.targetRate}`;
  if (payload.targetRate < payload.triggeredRate)
    return messageBuilder + `has gone above ${payload.targetRate}`;
  return messageBuilder + `has reached ${payload.targetRate}`;
};

const notifyApp = async (
  payload: {
    userId: ObjectId;
    alertId: ObjectId;
    msg: string;
    base: string;
    quota: string;
    triggeredTime: Date;
  } & {}
) => {
  // ws implemented in currency ws
  console.log("Notifying app about app", payload);
  wsEventEmitter.emit("notify-alert-triggered-user-app", {
    alertId: payload.alertId,
    userId: payload.userId,
    msg: payload.msg,
    base: payload.base,
    quota: payload.quota,
    triggeredTime: payload.triggeredTime,
  });
};

const notifyEmail = async (payload: { userId: ObjectId; msg: string } & {}) => {
  // TODO: Implement
  // throw new Error("Not implemented");
};

const notifyPhone = async (payload: { userId: ObjectId; msg: string } & {}) => {
  // TODO: Implement
  // throw new Error("Not implemented");
};

const updateAllCurrencyRate = async (
  fastify: FastifyInstance,
  data: {
    success: boolean;
    timestamp: number;
    date: string;
    rates: Record<string, number>;
  }
) => {
  return await Promise.allSettled(
    _.map(_.keysIn(data.rates), async (currency) => {
      const isSuccess = await getDbService(fastify).updateCurrencyRate({
        currency,
        rate: data.rates[currency],
      });

      if (isSuccess) return;
      if (isSuccess instanceof Error)
        return fastify.log.error({
          name: isSuccess.name,
          msg: isSuccess.message,
          stack: isSuccess.stack,
          on: "Currency Cron Job of " + currency,
        });
      return fastify.log.warn("Failed to update currency rate of " + currency);
    })
  );
};

const getNewCurrencyRates = async (apiKey: string) => {
  // const res = (await axios({
  //   method: "GET",
  //   url: `http://data.fixer.io/api/latest?access_key=${apiKey}`,
  // })) as AxiosResponse<{
  //   success: boolean;
  //   base: string;
  //   timestamp: number;
  //   date: string;
  //   rates: Record<string, number>;
  // }>;
  // if (res.data.success) return res.data;
  // return new Error("Failed to get new currency rate");
  return {
    success: true,
    timestamp: 1643281744,
    base: "EUR",
    date: "2022-01-27",
    rates: {
      AED: 4.109178,
      AFN: 116.053022,
      ALL: 120.534451,
      AMD: 542.27616,
      ANG: 2.016377,
      AOA: 591.226756,
      ARS: 117.1349,
      AUD: 1.580224,
      AWG: 2.008144,
      AZN: 1.905535,
      BAM: 1.947896,
      BBD: 2.268163,
      BDT: 96.575748,
      BGN: 1.952498,
      BHD: 0.421711,
      BIF: 2243.034411,
      BMD: 1.118743,
      BND: 1.510323,
      BOB: 7.745154,
      BRL: 6.078318,
      BSD: 1.123375,
      BTC: 3.0711024e-5,
      BTN: 84.079774,
      BWP: 12.919556,
      BYN: 2.937436,
      BYR: 21927.369987,
      BZD: 2.264378,
      CAD: 1.420608,
      CDF: 2243.080106,
      CHF: 1.038434,
      CLF: 0.032496,
      CLP: 895.722114,
      CNY: 7.12002,
      COP: 4396.661431,
      CRC: 718.751442,
      CUC: 1.118743,
      CUP: 29.646699,
      CVE: 109.818691,
      CZK: 24.493324,
      DJF: 199.984403,
      DKK: 7.443011,
      DOP: 64.85105,
      DZD: 157.093892,
      EGP: 17.605053,
      ERN: 16.781172,
      ETB: 55.945634,
      EUR: 1,
      FJD: 2.391594,
      FKP: 0.814356,
      GBP: 0.83489,
      GEL: 3.428945,
      GGP: 0.814355,
      GHS: 6.930833,
      GIP: 0.814355,
      GMD: 58.901913,
      GNF: 10127.050469,
      GTQ: 8.635405,
      GYD: 235.014887,
      HKD: 8.714104,
      HNL: 27.644147,
      HRK: 7.533054,
      HTG: 115.605822,
      HUF: 358.278641,
      IDR: 16077.51686,
      ILS: 3.575157,
      IMP: 0.814355,
      INR: 84.048387,
      IQD: 1639.452522,
      IRR: 47266.907497,
      ISK: 145.403062,
      JEP: 0.814356,
      JMD: 175.259004,
      JOD: 0.79316,
      JPY: 128.903283,
      KES: 127.079623,
      KGS: 94.867085,
      KHR: 4569.791511,
      KMF: 488.023881,
      KPW: 1006.869206,
      KRW: 1347.03973,
      KWD: 0.338789,
      KYD: 0.936087,
      KZT: 488.858881,
      LAK: 12693.300284,
      LBP: 1710.455213,
      LKR: 227.889408,
      LRD: 170.329012,
      LSL: 16.982278,
      LTL: 3.303359,
      LVL: 0.676717,
      LYD: 5.156428,
      MAD: 10.471549,
      MDL: 20.084596,
      MGA: 4477.672594,
      MKD: 61.38,
      MMK: 1997.316212,
      MNT: 3198.298401,
      MOP: 9.007911,
      MRO: 399.391189,
      MUR: 49.452968,
      MVR: 17.284931,
      MWK: 917.103632,
      MXN: 23.153345,
      MYR: 4.695925,
      MZN: 71.409044,
      NAD: 16.982246,
      NGN: 464.63599,
      NIO: 39.828736,
      NOK: 10.017586,
      NPR: 134.528478,
      NZD: 1.690164,
      OMR: 0.430743,
      PAB: 1.123325,
      PEN: 4.323988,
      PGK: 3.978591,
      PHP: 57.411111,
      PKR: 198.529663,
      PLN: 4.570903,
      PYG: 7897.187763,
      QAR: 4.07333,
      RON: 4.945296,
      RSD: 117.583534,
      RUB: 87.883988,
      RWF: 1166.650383,
      SAR: 4.197193,
      SBD: 9.025835,
      SCR: 14.368548,
      SDG: 492.810193,
      SEK: 10.448582,
      SGD: 1.512166,
      SHP: 1.540953,
      SLL: 12680.955804,
      SOS: 654.465002,
      SRD: 23.627986,
      STD: 23155.728957,
      SVC: 9.828967,
      SYP: 2810.283086,
      SZL: 17.006194,
      THB: 37.173601,
      TJS: 12.687623,
      TMT: 3.926789,
      TND: 3.258339,
      TOP: 2.537253,
      TRY: 15.232099,
      TTD: 7.626637,
      TWD: 31.128472,
      TZS: 2584.297342,
      UAH: 32.339825,
      UGX: 3959.707535,
      USD: 1.118743,
      UYU: 50.003337,
      UZS: 12151.915341,
      VEF: 239221142842.4721,
      VND: 25328.349822,
      VUV: 127.16914,
      WST: 2.922541,
      XAF: 653.32521,
      XAG: 0.048328,
      XAU: 0.000618,
      XCD: 3.02346,
      XDR: 0.802965,
      XOF: 653.32521,
      XPF: 119.006342,
      YER: 279.965622,
      ZAR: 17.059829,
      ZMK: 10070.036009,
      ZMW: 19.877627,
      ZWL: 360.234908,
    },
  };
};

const notifyPriceUpdate = () => {
  console.log("notifying of price update");
  wsEventEmitter.emit("price-update");
};

export default currencyCronPlugin;
