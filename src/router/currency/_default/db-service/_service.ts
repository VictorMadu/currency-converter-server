import { IMongo } from "../../../../db/mongo/_dtypes";
import MongoService from "./mongo";
import { IGetPrices } from "./_dtypes";

class DbService {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
  }

  async getPrices(payload: IGetPrices) {
    return await this.mongoService.getPrices(payload);
  }

  async getBaseId() {
    return await this.mongoService.getBaseId();
  }
}

export default DbService;

const d = {
  _id: 0,
  short: "_id",
  name: 1,
  curr_rate: { $divide: [{ $arrayElemAt: ["$rates.rate", -1] }, 12.3] },
};
