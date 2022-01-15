import { IMongo } from "../../../../db/mongo/_dtypes";
import MongoService from "./mongo";
import { IPostPrices, IGetCurrencyPrice } from "./_dtypes";

class DbService {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
  }

  async addAlert(payload: IPostPrices) {
    return await this.mongoService.addAlert(payload);
  }

  async getCurrencyPrice(payload: IGetCurrencyPrice) {
    return await this.mongoService.getCurrencyPrice(payload);
  }
}

export default DbService;
