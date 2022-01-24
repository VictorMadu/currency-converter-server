import fastify, { FastifyPluginAsync } from "fastify";
import mongoPlugin from "../../db/mongo";
import { MONGO_KEY } from "../_constants";
import getAlertsPlugin from "./get-alerts";
import listCurrenciesPlugin from "./list-currencies";
import postAlertPlugin from "./post-alert";
import getPricesPlugin from "./get-prices";

const currencyPlugin: FastifyPluginAsync<{ prefix: string }> = async (
  fastify
) => {
  fastify.register(mongoPlugin, { key: MONGO_KEY });
  fastify.register(getPricesPlugin, { prefix: "" });
  fastify.register(listCurrenciesPlugin, { prefix: "/list" });
  fastify.register(getAlertsPlugin, { prefix: "/get-alerts" });
  fastify.register(postAlertPlugin, { prefix: "/post-alert" });
};

export default currencyPlugin;
