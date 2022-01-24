import { IMongo } from "../../../../db/mongo/_dtypes";
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
    // const updateFilter: UpdateFilter<Document> | Partial<Document> = {};
    const ops: [string, string] =
      opts.action === "add" ? ["$addToSet", "$each"] : ["$pull", "$in"];

    const result = await this.mongo.col("users").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        [ops[0]]: { "settings.notify": { [ops[1]]: opts.notifyOptions } },
      }
    );

    if (result.modifiedCount > 1) console.error("Abnormality"); // TODO: turn to a fastify plugin and log error in log file or log db

    return result.modifiedCount === 1;
  }

  async updateTheme(id: string, opts: { theme: "light" | "dark" }) {
    const result = await this.mongo.col("users").updateOne(
      { _id: new ObjectId(id) },
      {
        "settings.theme": opts.theme,
      }
    );

    if (result.modifiedCount > 1) console.error("Abnormality"); // TODO: turn to a fastify plugin and log error in log file or log db

    return result.modifiedCount === 1;
  }
}

export default MongoService;
