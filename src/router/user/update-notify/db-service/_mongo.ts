import { getMongoProjection, ItemsStack } from "../../../../lib";
import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetUserConfig } from "./_dtype";
import { ObjectId, UpdateFilter, Document } from "mongodb";
import { NonEmptyArray } from "../../../../dtypes";

class MongoService {
  constructor(private mongo: IMongo) {}

  async updateNotify(
    id: string,
    opts: {
      notifyOptions: NonEmptyArray<"app" | "phone" | "email">;
      action: "add" | "remove";
    }
  ) {
    const updateFilter: UpdateFilter<Document> | Partial<Document> = {};
    const opt = { notify: { $each: opts.notifyOptions } };

    if (opts.action === "add")
      updateFilter.$addToSet = { notify: { $each: opts.notifyOptions } };
    else updateFilter.$pull = { notify: { $in: opts.notifyOptions } };

    const result = await this.mongo.col("users").updateOne(
      {
        _id: new ObjectId(id),
      },
      updateFilter
    );

    return !!result.modifiedCount;
  }
}

export default MongoService;
