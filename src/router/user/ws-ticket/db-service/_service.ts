import { IMongo } from "../../../../db/mongo/_dtypes";
import dbEventEmitter from "./event-emitter";
import MongoService from "./mongo";
import { IPostPrices, IGetCurrencyPrice } from "./_dtypes";

class DbService {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
    dbEventEmitter.on("verify-ticket", (payload: { ip: string }) => {
      this.verifyTicket(payload);
    });
  }

  async verifyTicket(payload: { ip: string }) {
    const userId = await this.mongoService.verifyTicket(payload);
    dbEventEmitter.emit("verified-ticket-user-id", userId);
  }

  async generateTicket(payload: { id: string; ip: string; ttl: number }) {
    return await this.mongoService.generateTicket(payload);
  }
}

export default DbService;
