import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { IMongo } from "../../../db/mongo/_dtypes";
import MongoService from "./mongo";

class DbService {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
  }

  async updateCurrencyRate(payload: { currency: string; rate: number }) {
    return await this.mongoService.updateCurrencyRate(payload);
  }

  async getAlertsToTrigger() {
    return await this.mongoService.getAlertsToTrigger();
  }

  async updateCurrencyMetaData(payload: { base: string; timestamp: Date }) {
    return await this.mongoService.updateCurrencyMetaData(payload);
  }

  async getUserNotifyMeans(userId: ObjectId) {
    return this.mongoService.getUserNotifyMeans(userId);
  }
}

export default DbService;
