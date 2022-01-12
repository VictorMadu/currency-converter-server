import { IMongo } from "../../../../db/mongo/_dtypes";

class MongoService {
  constructor(private mongo: IMongo) {}

  async addUser(payload: { email: string; phone: string; pwd: string }) {
    const result = await this.mongo.col("users").insertOne({
      email: payload.email,
      phone: payload.phone,
      pwd: payload.pwd,
      notify: ["app"],
    });

    return {
      id: result.insertedId.toString(),
      createdTime: result.insertedId.generationTime,
    };
  }

  async isEmailExist(email: string): Promise<boolean> {
    const cursor = await this.mongo
      .col("users")
      .find({ email: email }, { limit: 1 });

    const count = await cursor.count();
    cursor.close();
    return !!count;
  }
}

export default MongoService;
