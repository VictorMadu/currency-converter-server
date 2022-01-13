import { FastifyPluginAsync } from "fastify";
import currencyPlugin from "./currency";
import reqPayloadTransformedPlugin from "./req-payload-transformed";
import userPlugin from "./user";

const routerPlugin: FastifyPluginAsync<{ prefix: string }> = async (
  fastify
) => {
  fastify.register(reqPayloadTransformedPlugin);
  fastify.register(userPlugin, { prefix: "/user" });
  fastify.register(currencyPlugin, { prefix: "/currency" });
};

export default routerPlugin;
