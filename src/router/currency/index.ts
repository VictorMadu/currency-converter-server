import fastify, { FastifyPluginAsync } from "fastify";
import mongoPlugin from "../../db/mongo";
import { MONGO_KEY } from "../_constants";
import defaultPlugin from "./_default";

const currencyPlugin: FastifyPluginAsync<{ prefix: string }> = async (
  fastify
) => {
  fastify.register(mongoPlugin, { key: MONGO_KEY });
  fastify.register(defaultPlugin, { prefix: "" });
};

export default currencyPlugin;
