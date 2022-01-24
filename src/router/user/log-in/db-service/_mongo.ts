import { getMongoProjection, ItemsStack } from "../../../../_utils";
import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetUserConfig } from "./_dtype";

class MongoService {
  constructor(private mongo: IMongo) {}

  async getUser(email: string, config: IGetUserConfig) {
    const fields = new ItemsStack()
      .stack("_id", "email", "phone")
      .condition(!!config.includePassword)
      .stack("pwd")
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

    const user = await cursor.next();
    cursor.close();

    return user == null
      ? undefined
      : {
          id: user._id.toString() as string,
          email: user.email as string,
          phone: user.phone as string,
          pwd: user.pwd as string | undefined,
        };
  }
}

export default MongoService;
