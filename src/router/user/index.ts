import { FastifyPluginAsync } from "fastify";
import mongoPlugin from "../../db/mongo";
import { MONGO_KEY } from "../_constants";
import loginInPlugin from "./log-in";
import signUpPlugin from "./sign-up";
import updateNotifyPlugin from "./update-notify";

const userPlugin: FastifyPluginAsync<{ prefix: string }> = async (fastify) => {
  fastify.register(mongoPlugin, { key: MONGO_KEY });

  fastify.register(signUpPlugin, { prefix: "/sign-up" });
  fastify.register(loginInPlugin, { prefix: "/log-in" });
  fastify.register(updateNotifyPlugin, { prefix: "/notify" });
};

export default userPlugin;
