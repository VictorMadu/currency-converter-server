import { FastifyPluginAsync } from "fastify";
import currencyPlugin from "./currency";
import reqPayloadTransformedPlugin from "./req-payload-transformed";
import userPlugin from "./user";
import corsPlugin from "fastify-cors";

const routerPlugin: FastifyPluginAsync<{ prefix: string }> = async (
  fastify
) => {
  fastify.register(corsPlugin, {
    origin: (origin, cb) => {
      console.log("\n\nOrigin", origin);
      if (/http:\/\/localhost:3000\//.test(origin)) return cb(null, true);
      return cb(null, true);
      // return cb(new Error("Not allowed"), false);
    },
  });
  fastify.register(reqPayloadTransformedPlugin);
  fastify.register(userPlugin, { prefix: "/user" });
  fastify.register(currencyPlugin, { prefix: "/currency" });
};

export default routerPlugin;
