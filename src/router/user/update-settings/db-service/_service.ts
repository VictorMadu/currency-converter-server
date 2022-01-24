import { NonEmptyArray } from "../../../../dtypes";
import { IMongo } from "../../../../db/mongo/_dtypes";
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

  async updateTheme(id: string, opts: { theme: "light" | "dark" }) {
    return await this.mongoService.updateTheme(id, opts);
  }
}

export default Service;
