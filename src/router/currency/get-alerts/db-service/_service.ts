import { IMongo } from "../../../../db/mongo/_dtypes";
import MongoService from "./mongo";
import { IGetPrices } from "./_dtypes";

class DbService {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
  }

  async getAlerts(payload: IGetPrices) {
    return await this.mongoService.getAlerts(payload);
  }
}

export default DbService;
