import { FastifyPluginAsync } from "fastify";
import mongoPlugin from "../db/mongo";
import currencyCronPlugin from "./currency";
import { MONGO_KEY } from "./utils";

const cronPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(mongoPlugin, { key: MONGO_KEY });
  fastify.register(currencyCronPlugin);
};

export default cronPlugin;
