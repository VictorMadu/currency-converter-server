import { IMongo } from "../../../db/mongo/_dtypes";
import { AggregationCursor, ObjectId } from "mongodb";
import * as _ from "lodash";
import { ITriggeredAlertDocument } from "./_dtypes";

class MongoService {
  constructor(private mongo: IMongo) {}

  async updateCurrencyRate(payload: { currency: string; rate: number }) {
    try {
      const result = await this.mongo.col("currencies").updateOne(
        { _id: payload.currency },
        {
          $push: {
            rates: payload.rate,
          },
        }
      );
      return result.modifiedCount === 1;
    } catch (error) {
      return error;
    }
  }

  async getAlertsToTrigger(payload: { currTime: Date }) {
    const cursor: AggregationCursor<ITriggeredAlertDocument> = await this.mongo
      .col("currencies")
      .aggregate(this.getAlertsToTriggerPipeline(payload.currTime));
    return cursor;
  }

  async updateMetaData() {}

  async pushReachedAlertToTriggered(pendingAlert: ITriggeredAlertDocument) {
    try {
      const pullFromPending = await this.mongo.col("currencies").updateOne(
        { _id: pendingAlert.base },
        {
          $pull: {
            pending_alerts: { _id: pendingAlert._id },
          },
        }
      );

      const pushToTriggered = await this.mongo.col("currencies").updateOne(
        { _id: pendingAlert.base },
        {
          $push: {
            triggered_alerts: {
              _id: pendingAlert._id,
              user_id: pendingAlert.user.id,
              quota: pendingAlert.quota,
              set_ratio: pendingAlert.set_ratio,
              set_time: pendingAlert.set_time,
              target_ratio: pendingAlert.target_ratio,
              triggered_ratio: pendingAlert.triggered_ratio,
              triggered_time: pendingAlert.triggered_time,
            },
          },
        }
      );
      return [
        pullFromPending.modifiedCount === 1,
        pushToTriggered.modifiedCount === 1,
      ];
    } catch (error) {
      return error;
    }
  }

  async updateCurrencyMetaData(payload: { base: string; timestamp: Date }) {
    const cursor = await this.mongo.col("__meta").aggregate([
      {
        $match: {
          _id: "currencies",
        },
      },
      {
        $unwind: {
          path: "$bases",
        },
      },
      {
        $match: {
          "bases.id": {
            $exists: 1,
          },
        },
      },
      {
        $sort: {
          timestamp: 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          bases: {
            $push: "$bases",
          },
        },
      },
      {
        $project: {
          _id: 0,
          lastBase: {
            $last: "$bases",
          },
        },
      },
    ]);
    const [result] = ((await cursor.toArray()) as unknown) as [
      { lastBase: { id: string; timestamp: Date } }
    ];

    const updateCmd: { timestamp: Date; id?: string } = {
      timestamp: payload.timestamp,
    };
    if (result.lastBase.id !== payload.base) updateCmd.id = payload.base;

    const updateResult = await this.mongo
      .col("__meta")
      .updateOne({ _id: "currencies" }, { $push: { bases: updateCmd } });

    return updateResult.acknowledged;
  }

  async getUserNotifyMeans(userId: ObjectId) {
    const cursor = await this.mongo
      .col("users")
      .find(
        { _id: userId },
        { limit: 1, projection: { notificationMeans: "$notify" } }
      );

    const [user] = ((await cursor.toArray()) as unknown) as [
      { notificationMeans: ("app" | "email" | "phone")[] }
    ];
    return user.notificationMeans;
  }

  getAlertsToTriggerPipeline(currTime: Date) {
    return [
      {
        $project: {
          _id: 0,
          short: "$_id",
          name: 1,
          curr_timestamp: currTime,
          curr_rate: {
            $last: "$rates",
          },
          pending_alerts: 1,
        },
      },
      {
        $unwind: {
          path: "$pending_alerts",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "currencies",
          let: {
            curr_rate: "$pending_alerts.quota",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$curr_rate", "$_id"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                short: "$_id",
                name: 1,
                curr_rate: {
                  $last: "$rates",
                },
              },
            },
          ],
          as: "quota",
        },
      },
      {
        $unwind: {
          path: "$quota",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          "pending_alerts.quota": 0,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                curr_ratio: {
                  $trunc: [
                    {
                      $divide: ["$quota.curr_rate", "$curr_rate"],
                    },
                    6,
                  ],
                },
              },
              "$$ROOT",
            ],
          },
        },
      },
      {
        $project: {
          curr_rate: 0,
          "quota.curr_rate": 0,
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              {
                $and: [
                  {
                    $lt: [
                      "$pending_alerts.target_ratio",
                      "$pending_alerts.set_ratio",
                    ],
                  },
                  {
                    $lt: ["$curr_ratio", "$pending_alerts.target_ratio"],
                  },
                ],
              },
              {
                $and: [
                  {
                    $gte: [
                      "$pending_alerts.target_ratio",
                      "$pending_alerts.set_ratio",
                    ],
                  },
                  {
                    $gte: ["$curr_ratio", "$pending_alerts.target_ratio"],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            userId: "$pending_alerts.user_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$userId", "$_id"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: "$$userId",
                email: "$email",
                phone: "$phone",
                notification_medium: { $ifNull: ["$settings.notify", []] },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $project: {
          triggered_time: "$$NOW",
          triggered_ratio: "$curr_ratio",
          base: "$short",
          user: {
            $first: "$user",
          },
          _id: "$pending_alerts._id",
          set_time: "$pending_alerts.set_time",
          target_ratio: "$pending_alerts.target_ratio",
          set_ratio: "$pending_alerts.set_ratio",
          quota: "$quota.short",
        },
      },
    ];
  }
}

export default MongoService;
