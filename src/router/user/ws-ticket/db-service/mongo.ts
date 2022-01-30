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
    const userDeleted = await this.mongo
      .col("ws_user_ticket")
      .deleteOne({ _id: new ObjectId(payload.id) });
    const result = await this.mongo.col("ws_user_ticket").insertOne({
      _id: new ObjectId(payload.id),
      ip: payload.ip,
      expireAt: new Date(new Date().getTime() + payload.ttl * 1000),
    });

    return result.acknowledged;
  }

  async verifyTicket(payload: { ip: string }) {
    const cursor = await this.mongo
      .col("ws_user_ticket")
      .find({ ip: payload.ip }, { limit: 1 });

    const [user] = await cursor.toArray();
    return user?._id as ObjectId | undefined;
  }
}

export default MongoService;
