import fastify, { FastifyPluginAsync } from "fastify";
import mongoPlugin from "../../db/mongo";
import { MONGO_KEY } from "../_constants";
import getAlertsPlugin from "./get-alerts";
import listPlugin from "./list";
import postAlertPlugin from "./post-alert";
import defaultPlugin from "./_default";

const currencyPlugin: FastifyPluginAsync<{ prefix: string }> = async (
  fastify
) => {
  fastify.register(mongoPlugin, { key: MONGO_KEY });
  fastify.register(defaultPlugin, { prefix: "" });
  fastify.register(listPlugin, { prefix: "/list" });
  fastify.register(getAlertsPlugin, { prefix: "/get-alerts" });
  fastify.register(postAlertPlugin, { prefix: "/post-alert" });
};

export default currencyPlugin;
