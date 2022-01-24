import { CronJob } from "cron";
import axios, { AxiosResponse } from "axios";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { getConfig } from "../../config";
import * as _ from "lodash";
import dbServicePlugin, { getDbService } from "./db-service";
import DbService from "./db-service/_service";
import { AggregationCursor, Document, ObjectId } from "mongodb";
import { ITriggeredAlertDocument } from "./db-service/_dtypes";
import wsEventEmitter from "../../ws/event-emitter";

const currencyCronPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);
  const apiKeys = _.keysIn(
    _.get(getConfig(fastify), "currency_rate_api_keys") as Record<
      number,
      string
    >
  );
  const apiKeysLength = apiKeys.length;
  let currApiKeyIndex = -1;

  const job = new CronJob("1 * * * * *", async () => {
    console.log("On cron job");
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

    const dbService = getDbService(fastify);
    await updateAllCurrencyRate(fastify, data, dbService);
    await updateMetaData(fastify, data, dbService);

    const cursor = await dbService.getAlertsToTrigger();
    await notifyUsersAndPushToTriggered(cursor, dbService, fastify);
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
  },
  dbService: DbService
) => {
  const success = await dbService.updateCurrencyMetaData({
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
  dbService: DbService,
  fastify: FastifyInstance
) => {
  let triggeredAlert: ITriggeredAlertDocument | null;
  while ((triggeredAlert = await cursor.next())) {
    notifyUser(
      {
        userId: triggeredAlert.user_id,
        base: triggeredAlert.base,
        quota: triggeredAlert.quota,
        targetRate: triggeredAlert.target_ratio,
        triggeredRate: triggeredAlert.triggered_ratio,
      },
      dbService,
      fastify
    );
  }
};

const notifyUser = async (
  payload: {
    userId: ObjectId;
    base: string;
    quota: string;
    targetRate: number;
    triggeredRate: number;
  },
  dbService: DbService,
  fastify: FastifyInstance
) => {
  const notificationActions = {
    app: notifyApp,
    email: notifyEmail,
    phone: notifyPhone,
  };
  const notificationMeans = await dbService.getUserNotifyMeans(payload.userId);
  if (!notificationMeans || notificationMeans.length) {
    fastify.log.warn(
      "Cant retrieve the notification Means of user with id",
      payload.userId
    );
    return;
  }

  const msg = getMessage({
    base: payload.base,
    quota: payload.quota,
    targetRate: payload.targetRate,
    triggeredRate: payload.triggeredRate,
  });

  _.map(notificationMeans, (mean) =>
    notificationActions[mean]({ userId: payload.userId, msg })
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

const notifyApp = async (payload: { userId: ObjectId; msg: string }) => {
  // ws implemented in currency ws
  wsEventEmitter.emit("notify-alert-triggered-user-app__" + payload.userId, {
    data: payload,
  });
};

const notifyEmail = async (payload: { userId: ObjectId; msg: string }) => {
  // TODO: Implement
  throw new Error("Not implemented");
};

const notifyPhone = async (payload: { userId: ObjectId; msg: string }) => {
  // TODO: Implement
  throw new Error("Not implemented");
};

const updateAllCurrencyRate = async (
  fastify: FastifyInstance,
  data: {
    success: boolean;
    timestamp: number;
    date: string;
    rates: Record<string, number>;
  },
  dbService: DbService
) => {
  return await Promise.allSettled(
    _.map(_.keysIn(data.rates), async (currency) => {
      const isSuccess = await dbService.updateCurrencyRate({
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
  const res = (await axios({
    method: "GET",
    url: `http://data.fixer.io/api/latest?access_key=${apiKey}`,
  })) as AxiosResponse<{
    success: boolean;
    base: string;
    timestamp: number;
    date: string;
    rates: Record<string, number>;
  }>;
  if (res.data.success) return res.data;
  return new Error("Failed to get new currency rate");
};

export default currencyCronPlugin;
