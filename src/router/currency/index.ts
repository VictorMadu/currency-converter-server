import fastify, { FastifyPluginAsync } from "fastify";
import mongoPlugin from "../../db/mongo";
import { MONGO_KEY } from "../_constants";
import listPlugin from "./list";
import defaultPlugin from "./_default";

const currencyPlugin: FastifyPluginAsync<{ prefix: string }> = async (
  fastify
) => {
  fastify.register(mongoPlugin, { key: MONGO_KEY });
  fastify.register(defaultPlugin, { prefix: "" });
  fastify.register(listPlugin, { prefix: "/list" });
};

export default currencyPlugin;
