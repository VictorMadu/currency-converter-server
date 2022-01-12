import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetUserConfig } from "./_dtype";
import MongoService from "./_mongo";

class Service {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
  }
  async getUser(email: string, config?: IGetUserConfig) {
    return await this.mongoService.getUser(email, config ?? {});
  }
}

export default Service;
