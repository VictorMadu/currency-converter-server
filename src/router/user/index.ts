import { FastifyPluginAsync } from "fastify";
import mongoPlugin from "../../db/mongo";
import { MONGO_KEY } from "../_constants";
import loginInPlugin from "./log-in";
import updateSettingsPlugin from "./settings";
import signUpPlugin from "./sign-up";
import updateNotifyPlugin from "./settings";
import wsTicketPlugin from "./ws-ticket";

const userPlugin: FastifyPluginAsync<{ prefix: string }> = async (fastify) => {
  fastify.register(mongoPlugin, { key: MONGO_KEY });

  fastify.register(signUpPlugin, { prefix: "/sign-up" });
  fastify.register(loginInPlugin, { prefix: "/log-in" });
  fastify.register(updateNotifyPlugin, { prefix: "/notify" });
  fastify.register(updateSettingsPlugin, { prefix: "/settings" });
  fastify.register(wsTicketPlugin, { prefix: "/ws-ticket" });
};

export default userPlugin;
