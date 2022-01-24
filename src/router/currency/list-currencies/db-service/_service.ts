import { IMongo } from "../../../../db/mongo/_dtypes";
import MongoService from "./mongo";

class DbService {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
  }

  async listAllCurrencies() {
    return await this.mongoService.listAllCurrencies();
  }
}

export default DbService;
