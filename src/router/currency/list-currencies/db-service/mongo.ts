import { IMongo } from "../../../../db/mongo/_dtypes";

class MongoService {
  constructor(private mongo: IMongo) {}

  async listAllCurrencies() {
    const cursor = await this.mongo
      .col("currencies")
      .find({}, { projection: { _id: 0, short: "$_id", name: 1 } });

    const currencies = await cursor.toArray();
    cursor.close();
    return (currencies as unknown) as {
      short: string;
      name: string;
    }[];
  }
}

export default MongoService;
