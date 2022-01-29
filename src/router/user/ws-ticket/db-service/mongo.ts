import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetCurrencyPrice, IPostPrices } from "./_dtypes";
import { Document } from "mongodb";
import * as _ from "lodash";
import { throwError } from "../../../../_utils";
import { ObjectId } from "mongodb";

class MongoService {
  private isCreatedIndex = false;
  constructor(private mongo: IMongo) {}

  // TODO: Run this in the dbServie not by yourself for speed
  private async createIndex() {
    if (this.isCreatedIndex) return;
    await this.mongo.col("ws_user_ticket").createIndex({ ip: 1 });
    await this.mongo
      .col("ws_user_ticket")
      .createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });

    this.isCreatedIndex = true;
  }

  async generateTicket(payload: { id: string; ip: string; ttl: number }) {
    await this.createIndex();
    console.log("Trying to deleting user");
    const userDeleted = await this.mongo
      .col("ws_user_ticket")
      .deleteOne({ _id: new ObjectId(payload.id) });
    console.log("Logging deleted", userDeleted);
    const result = await this.mongo.col("ws_user_ticket").insertOne({
      _id: new ObjectId(payload.id),
      ip: payload.ip,
      expireAt: new Date(new Date().getTime() + payload.ttl * 1000),
    });
    console.log("Result of inserting the ws user ticket", result);

    return result.acknowledged;
  }

  async verifyTicket(payload: { ip: string }) {
    console.log("IP", payload.ip);
    const cursor = await this.mongo
      .col("ws_user_ticket")
      .find({ ip: payload.ip }, { limit: 1 });

    const [user] = await cursor.toArray();
    console.log("USER", user);
    return user?._id as ObjectId | undefined;
  }
}

export default MongoService;
