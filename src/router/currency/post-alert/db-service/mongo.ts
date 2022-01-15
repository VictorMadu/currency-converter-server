import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetCurrencyPrice, IPostPrices } from "./_dtypes";
import { Document } from "mongodb";
import * as _ from "lodash";
import { throwError } from "../../../../lib";
import { ObjectId } from "mongodb";

class MongoService {
  constructor(private mongo: IMongo) {}

  async addAlert(payload: IPostPrices) {
    const result = await this.mongo
      .col("currencies")
      .updateOne({ _id: payload.base }, [
        {
          $set: {
            pending_alerts: {
              $concatArrays: [
                { $ifNull: ["$pending_alerts", []] },
                [
                  {
                    _id: new ObjectId(),
                    userId: new ObjectId(payload.userId),
                    quota: payload.quota,
                    set_time: "$$NOW",
                    set_ratio: {
                      $round: [
                        {
                          $divide: [payload.quotaCurRate, { $last: "$rates" }],
                        },
                        6,
                      ],
                    },
                    target_ratio: payload.targetRate,
                  },
                ],
              ],
            },
          },
        },
      ]);

    console.log("result", result);
    return result.modifiedCount === 1;
  }

  async getCurrencyPrice(payload: IGetCurrencyPrice) {
    const cursor = await this.mongo.col("currencies").find(
      { _id: payload.short },
      {
        limit: 1,
        projection: { curr_rate: { $last: "$rates" } },
      }
    );

    const currency = await cursor.next();
    cursor.close();

    console.log("currency price", payload.short, currency);

    return currency?.curr_rate as number | null;
  }
}

export default MongoService;
