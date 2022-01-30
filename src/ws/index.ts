import { FastifyPluginAsync } from "fastify";
import { parse } from "url";
import currencyWsPlugin, { getCurrencyWsHandler } from "./currency";
import * as _ from "lodash";
import dbEventEmitter from "../router/user/ws-ticket/db-service/event-emitter";
import { ObjectId } from "mongodb";
import mongoPlugin from "../db/mongo";

const wsPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(currencyWsPlugin, { prefix: "/currency" });

  fastify.server.on("upgrade", (request, socket, head) => {
    const { pathname } = request.url ? parse(request.url) : { pathname: "" };
    dbEventEmitter.emit("verify-ticket", { ip: request.socket.remoteAddress });
    dbEventEmitter.on(
      "verified-ticket-user-id",
      (userId: ObjectId | undefined) => {
        if (!userId) return socket.destroy();
        if (_.includes(pathname, "/currency"))
          getCurrencyWsHandler(fastify).handle(request, socket, head, {
            id: userId,
          });
        else socket.destroy();
        return;
      }
    );
  });
};

export default wsPlugin;
