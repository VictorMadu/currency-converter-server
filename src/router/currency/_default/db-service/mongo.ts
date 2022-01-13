import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetPrices } from "./_dtypes";
import { Document } from "mongodb";
import * as _ from "lodash";
import { throwError } from "../../../../lib";

class MongoService {
  constructor(private mongo: IMongo) {}

  async getPrices(payload: IGetPrices) {
    const matchQuery = payload.currencies
      ? {
          _id: {
            $in: _.filter(payload.currencies, (curr) => curr !== payload.base),
          },
        }
      : {};

    const baseLastTwoRates = await this.getBaseLastTwoRates(payload.base);
    const cursor = await this.mongo
      .col("currencies")
      .aggregate(this.getPricePipeline(matchQuery, ...baseLastTwoRates));
    const currencies = await cursor.toArray();

    return currencies as Array<{
      short: string;
      name: string;
      prev_rate: number;
      curr_rate: number;
    }>;
  }

  async getBaseId() {
    const cursor = await this.mongo.col("__meta").find(
      { _id: "currencies" },
      {
        limit: 1,
        projection: {
          _id: 0,
          base: { $last: "$bases.id" },
        },
      }
    );

    const result = await cursor.next();
    cursor.close();

    return result?.base as string | undefined;
  }

  private async getBaseLastTwoRates(
    baseId: string
  ): Promise<[number | undefined, number]> {
    const cursor = await this.mongo.col("currencies").find(
      { _id: baseId },
      {
        limit: 1,
        projection: { _id: 0, lastTwo: { $slice: ["$rates.rate", -2] } },
      }
    );

    const result = await cursor.next();
    if (result == null)
      return throwError(
        "'base' currency does not exist in the currencies collection"
      );
    const lastTwo = result!.lastTwo as [number] | [number, number];

    cursor.close();
    return lastTwo.length === 1 ? [undefined, ...lastTwo] : lastTwo;
  }

  private getPricePipeline(
    matchQuery: Document,
    basePrevPrice: number | undefined,
    baseCurrPrice: number
  ) {
    return [
      {
        $match: matchQuery,
      },
      {
        $project: {
          _id: 0,
          short: "$_id",
          name: 1,
          prev_rate: {
            $round: [
              {
                $divide: [
                  {
                    $arrayElemAt: ["$rates.rate", -2],
                  },
                  basePrevPrice,
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
                    $arrayElemAt: ["$rates.rate", -1],
                  },
                  baseCurrPrice,
                ],
              },
              6,
            ],
          },
        },
      },
    ];
  }
}

export default MongoService;
