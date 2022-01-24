import { FastifyPluginAsync } from "fastify";
import currencyCronPlugin from "./currency";

const cronPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(currencyCronPlugin);
};

export default cronPlugin;
