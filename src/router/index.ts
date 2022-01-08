import { FastifyPluginAsync } from "fastify";
import userPlugin from "./user";

const routerPlugin: FastifyPluginAsync<{ prefix: string }> = async (
  fastify
) => {
  fastify.register(userPlugin, { prefix: "/user" });
};

export default routerPlugin;
