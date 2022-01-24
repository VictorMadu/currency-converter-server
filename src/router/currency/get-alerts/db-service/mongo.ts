import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetPriceOut, IGetPrices } from "./_dtypes";
import { Document } from "mongodb";
import * as _ from "lodash";
import { throwError } from "../../../../_utils";
import { ObjectId } from "mongodb";

class MongoService {
  constructor(private mongo: IMongo) {}

  async getAlerts(payload: IGetPrices) {
    console.log(
      "\n\n\n",
      JSON.stringify(
        this.getPipeline(
          new ObjectId(payload.userId),
          payload.bases,
          payload.quotas,
          payload.type
        )
      )
    );
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

    return alert as IGetPriceOut[];
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
                          quotas
                            ? {
                                $in: ["$$pending_alert.quota", quotas],
                              }
                            : true,
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
                          quotas
                            ? {
                                $in: [
                                  "$$triggered_alert.quota",
                                  ["NGN", "AFN"],
                                ],
                              }
                            : true,
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
          // name: 1,
          // prev_rate: { $arrayElemAt: ["$rates", -2] },
          // curr_rate: { $arrayElemAt: ["$rates", -1] },
          ...this.getAggregateForType(
            {
              pending_alerts: {
                $map: {
                  input: "$pending_alerts",
                  in: {
                    id: "$$this._id",
                    set_time: "$$this.set_time",
                    target_rate: "$$this.target_ratio",
                    set_rate: "$$this.set_ratio",
                    quota: "$$this.quota._id",
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
                    id: "$$this._id",
                    set_time: "$$this.set_time",
                    target_rate: "$$this.target_ratio",
                    set_rate: "$$this.set_ratio",
                    quota: "$$this.quota._id",
                    triggered_time: "$$this.triggered_time",
                    triggered_rate: "$$this.triggered_ratio",
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
      {
        $project: {
          base: "$short",
          alerts: {
            $concatArrays: [
              {
                $ifNull: ["$pending_alerts", []],
              },
              {
                $ifNull: ["$triggered_alerts", []],
              },
            ],
          },
        },
      },
      {
        $unwind: {
          path: "$alerts",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$alerts"],
          },
        },
      },
      {
        $project: {
          prev_rate: 0,
          curr_rate: 0,
          alerts: 0,
        },
      },
      {
        $sort: {
          set_time: -1,
          triggered_time: -1,
        },
      },
      {
        $group: {
          _id: {
            base: "$base",
            quota: "$quota",
          },
          alerts: {
            $push: {
              id: "$id",
              set_time: {
                day: {
                  $dayOfMonth: "$set_time",
                },
                month: {
                  $month: "$set_time",
                },
                year: {
                  $year: "$set_time",
                },
              },
              set_rate: "$set_rate",
              target_rate: "$target_rate",
              triggered_time: {
                day: {
                  $dayOfMonth: "$triggered_time",
                },
                month: {
                  $month: "$triggered_time",
                },
                year: {
                  $year: "$triggered_time",
                },
              },
              triggered_rate: "$triggered_rate",
            },
          },
        },
      },
      {
        $project: {
          id: "$_id",
          alerts: 1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $match: {
          "alerts.id": {
            $not: {
              $in: [],
            },
          },
        },
      },
      {
        $sort: {
          "alerts.triggered_time": -1,
          "alerts.set_time": -1,
        },
      },
    ];
  }
}

export default MongoService;
