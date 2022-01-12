import { IMongo } from "../../../../db/mongo/_dtypes";
import MongoService from "./mongo";

class DbService {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
  }
  async addUser(payload: { email: string; phone: string; pwd: string }) {
    return await this.mongoService.addUser(payload);
  }

  async isEmailExist(email: string) {
    return await this.mongoService.isEmailExist(email);
  }
}

export default DbService;
