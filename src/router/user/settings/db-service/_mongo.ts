import { IMongo } from "../../../../db/mongo/_dtypes";
import { ObjectId } from "mongodb";
import { NonEmptyArray } from "../../../../dtypes";
import { getMongoProjection, ItemsStack } from "../../../../_utils";
import { IGetUserConfig } from "./_dtype";

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
        $set: { "settings.app_theme": opts.theme },
      }
    );

    if (result.modifiedCount > 1) console.error("Abnormality"); // TODO: turn to a fastify plugin and log error in log file or log db

    return result.modifiedCount === 1;
  }

  async getUser(email: string, config: IGetUserConfig) {
    const fields = new ItemsStack()
      .condition(config.includeId)
      .stack("_id")
      .condition(config.includeEmail)
      .stack("email")
      .condition(config.includePhone)
      .stack("phone")
      .condition(config.includePassword)
      .stack("pwd")
      .condition(config.includeNotify)
      .stack("settings.notify")
      .condition(config.includeTheme)
      .stack("settings.app_theme")
      .getItems();

    const cursor = await this.mongo.col("users").find(
      {
        email: email,
      },
      {
        projection: getMongoProjection(fields),
        limit: 1,
      }
    );

    const [user] = await cursor.toArray();
    return user == null
      ? undefined
      : {
          id: user?._id.toString() as string | undefined,
          email: user?.email as string | undefined,
          phone: user?.phone as string | undefined,
          pwd: user?.pwd as string | undefined,
          notify_opts: user?.settings?.notify as
            | ("app" | "email" | "phone")[]
            | undefined,
          app_theme: user?.settings?.app_theme as "light" | "dark" | undefined,
        };
  }
}

export default MongoService;
