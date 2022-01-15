import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetPrices, IGetPricesOut } from "./_dtypes";
import { Document } from "mongodb";
import * as _ from "lodash";
import { throwError } from "../../../../lib";
import { ObjectId } from "mongodb";

class MongoService {
  constructor(private mongo: IMongo) {}

  async getAlerts(payload: IGetPrices) {
    const cursor = await this.mongo
      .col("currencies")
      .aggregate(
        this.getPipeline(
          new ObjectId(payload.userId),
          payload.bases,
          payload.quotas,
          payload.type
        )
      );
    // TODO: Next use limit or stream
    const alert = await cursor.toArray();

    return alert as
      | IGetPricesOut<true, true>
      | IGetPricesOut<true, false>
      | IGetPricesOut<false, true>;
  }

  private getMatchQuery(base?: string[]) {
    const match: Record<string, any> = {};
    if (base) match._id = { $in: base };
    match.$or = [
      { pending_alerts: { $exists: true } },
      { triggered_alerts: { $exists: true } },
    ];
    return match;
  }

  private aggIsIn(field: string, bases?: string[]) {
    if (_.isUndefined(bases)) return true;
    return { $in: [field, bases] };
  }

  private getAggregateForType(
    aggregate: Record<string, any>,
    typeCat: "pending" | "triggered",
    type?: "pending" | "triggered"
  ) {
    if (!type || type === typeCat) return aggregate;
    return undefined;
  }

  private getPipeline(
    userId: ObjectId,
    bases?: string[],
    quotas?: string[],
    type?: "pending" | "triggered"
  ) {
    return [
      {
        $match: this.getMatchQuery(bases),
      },
      {
        $project: {
          _id: 0,
          short: "$_id",
          name: 1,
          rates: 1,
          ...this.getAggregateForType(
            {
              pending_alerts: {
                $ifNull: [
                  {
                    $filter: {
                      input: "$pending_alerts",
                      as: "pending_alert",
                      cond: {
                        $and: [
                          {
                            $eq: ["$$pending_alert.user_id", userId],
                          },
                          this.aggIsIn("$$pending_alert.quota", quotas),
                        ],
                      },
                    },
                  },
                  [],
                ],
              },
            },
            "pending",
            type
          ),
          ...this.getAggregateForType(
            {
              triggered_alerts: {
                $ifNull: [
                  {
                    $filter: {
                      input: "$triggered_alerts",
                      as: "triggered_alert",
                      cond: {
                        $and: [
                          {
                            $eq: ["$$triggered_alert.user_id", userId],
                          },
                          this.aggIsIn("$$triggered_alert.quota", quotas),
                        ],
                      },
                    },
                  },
                  [],
                ],
              },
            },
            "triggered",
            type
          ),
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "pending_alerts.quota",
          foreignField: "_id",
          as: "pending_alerts_quota",
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "triggered_alerts.quota",
          foreignField: "_id",
          as: "triggered_alerts_quota",
        },
      },
      {
        $project: {
          short: 1,
          name: 1,
          rates: 1,
          ...this.getAggregateForType(
            {
              pending_alerts: {
                $map: {
                  input: "$pending_alerts",
                  as: "pending_alert",
                  in: {
                    $mergeObjects: [
                      "$$pending_alert",
                      {
                        quota: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$pending_alerts_quota",
                                cond: {
                                  $eq: ["$$this._id", "$$pending_alert.quota"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
            "pending",
            type
          ),
          ...this.getAggregateForType(
            {
              triggered_alerts: {
                $map: {
                  input: "$triggered_alerts",
                  as: "triggered_alert",
                  in: {
                    $mergeObjects: [
                      "$$triggered_alert",
                      {
                        quota: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$triggered_alerts_quota",
                                cond: {
                                  $eq: [
                                    "$$this._id",
                                    "$$triggered_alert.quota",
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
            "triggered",
            type
          ),
        },
      },
      {
        $project: {
          short: 1,
          name: 1,
          ...this.getAggregateForType(
            {
              pending_alerts: {
                $map: {
                  input: "$pending_alerts",
                  in: {
                    set_time: "$$this.set_time",
                    target_rate: "$$this.target_ratio",
                    set_rate: "$$this.set_ratio",
                    quota_short: "$$this.quota._id",
                    quota_name: "$$this.quota.name",
                    prev_rate: {
                      $round: [
                        {
                          $divide: [
                            {
                              $arrayElemAt: ["$$this.quota.rates", -2],
                            },
                            {
                              $arrayElemAt: ["$rates", -2],
                            },
                          ],
                        },
                        6,
                      ],
                    },
                    curr_rate: {
                      $round: [
                        {
                          $divide: [
                            {
                              $arrayElemAt: ["$$this.quota.rates", -1],
                            },
                            {
                              $arrayElemAt: ["$rates", -1],
                            },
                          ],
                        },
                        6,
                      ],
                    },
                  },
                },
              },
            },
            "pending",
            type
          ),
          ...this.getAggregateForType(
            {
              triggered_alerts: {
                $map: {
                  input: "$triggered_alerts",
                  in: {
                    set_time: "$$this.set_time",
                    target_rate: "$$this.target_ratio",
                    set_rate: "$$this.set_ratio",
                    triggered_rate: "$$this.triggered_ratio",
                    triggered_time: "$$this.triggered_time",
                    quota_short: "$$this.quota._id",
                    quota_name: "$$this.quota.name",
                    prev_rate: {
                      $round: [
                        {
                          $divide: [
                            {
                              $arrayElemAt: ["$$this.quota.rates", -2],
                            },
                            {
                              $arrayElemAt: ["$rates", -2],
                            },
                          ],
                        },
                        6,
                      ],
                    },
                    curr_rate: {
                      $round: [
                        {
                          $divide: [
                            {
                              $arrayElemAt: ["$$this.quota.rates", -1],
                            },
                            {
                              $arrayElemAt: ["$rates", -1],
                            },
                          ],
                        },
                        6,
                      ],
                    },
                  },
                },
              },
            },
            "triggered",
            type
          ),
        },
      },
    ];
  }
}

export default MongoService;
