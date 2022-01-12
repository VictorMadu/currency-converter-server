import { FastifyInstance } from "fastify";
import { get } from "lodash";
import { getConfig } from "../../config";
import { IMongoConfig } from "./_dtypes";
import { MongoService } from "./_utils";

const decorator = async (fastify: FastifyInstance, mongoKey: string) => {
  let mongoService: MongoService;

  fastify.addHook("onClose", async () => {
    await mongoService?.close();
    console.log("Mongo DB with key", mongoKey, "has successfully been closed");
  });

  // fastify.addHook("onError", () => {
  //   console.log("Mongo DB with key", mongoKey, "cannot connect");
  // });

  const mongoConfig = get(
    getConfig(fastify),
    "db.mongo." + mongoKey
  ) as IMongoConfig;
  console.log("\n\n", "MONGO CONFIG\n", mongoConfig);

  mongoService = new MongoService(mongoConfig);
  await mongoService.connect();
  await mongoService.ping();
  console.log("Mongo DB with key", mongoKey, "has successfully connected");

  return {
    db: mongoService.db,
    col: mongoService.col,
  };
};

export default decorator;
