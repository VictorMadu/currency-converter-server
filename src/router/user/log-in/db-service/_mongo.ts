import { getMongoProjection, ItemsStack } from "../../../../_utils";
import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetUserConfig } from "./_dtype";

class MongoService {
  constructor(private mongo: IMongo) {}

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
