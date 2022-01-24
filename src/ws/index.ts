import { FastifyPluginAsync } from "fastify";
import { parse } from "url";
import currencyWsPlugin, { getCurrencyWsHandler } from "./currency";
import * as _ from "lodash";

const wsPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(currencyWsPlugin, { prefix: "/currency" });

  fastify.server.on("upgrade", (request, socket, head) => {
    const { pathname } = request.url ? parse(request.url) : { pathname: "" };
    console.log("\n\nRequest on ", pathname);
    if (_.includes(pathname, "/currency"))
      getCurrencyWsHandler(fastify).handle(request, socket, head);
    else socket.destroy();
  });
};

export default wsPlugin;
