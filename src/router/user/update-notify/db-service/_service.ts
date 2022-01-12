import { NonEmptyArray } from "../../../../dtypes";
import { IMongo } from "../../../../db/mongo/_dtypes";
import { IGetUserConfig } from "./_dtype";
import MongoService from "./_mongo";

class Service {
  private mongoService: MongoService;
  constructor(mongo: IMongo) {
    this.mongoService = new MongoService(mongo);
  }
  async updateNotify(
    id: string,
    opts: {
      notifyOptions: NonEmptyArray<"app" | "phone" | "email">;
      action: "add" | "remove";
    }
  ) {
    return await this.mongoService.updateNotify(id, opts);
  }
}

export default Service;
