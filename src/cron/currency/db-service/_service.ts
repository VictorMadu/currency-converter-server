import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { IMongo } from "../../../db/mongo/_dtypes";
import MongoService from "./mongo";
import { ITriggeredAlertDocument } from "./_dtypes";

class DbService {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
  }

  async updateCurrencyRate(payload: { currency: string; rate: number }) {
    return await this.mongoService.updateCurrencyRate(payload);
  }

  async getAlertsToTrigger(payload: { currTime: Date }) {
    return await this.mongoService.getAlertsToTrigger(payload);
  }

  async updateCurrencyMetaData(payload: { base: string; timestamp: Date }) {
    return await this.mongoService.updateCurrencyMetaData(payload);
  }

  async getUserNotifyMeans(userId: ObjectId) {
    return this.mongoService.getUserNotifyMeans(userId);
  }

  async pushReachedAlertToTriggered(triggeredAlert: ITriggeredAlertDocument) {
    return this.mongoService.pushReachedAlertToTriggered(triggeredAlert);
  }
}

export default DbService;
