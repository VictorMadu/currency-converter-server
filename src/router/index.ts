import { FastifyPluginAsync } from "fastify";
import reqPayloadTransformedPlugin from "./req-payload-transformed";
import userPlugin from "./user";

const routerPlugin: FastifyPluginAsync<{ prefix: string }> = async (
  fastify
) => {
  fastify.register(reqPayloadTransformedPlugin);
  fastify.register(userPlugin, { prefix: "/user" });
};

export default routerPlugin;
