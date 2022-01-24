import fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { IncomingMessage } from "http";
import { getConfig } from "../../config";
import internal from "stream";
import { WebSocketServer } from "ws";
import * as jwt from "../../_utils/jwt";
import * as _ from "lodash";
import connectionHandlerPlugin from "./connection-handler";

const $currencyWsSymbol = Symbol("currencyWsSymbol");
const wss = new WebSocketServer({ noServer: true });

const currencyWsPlugin: FastifyPluginAsync<{ prefix: string }> = fp(
  async (fastify, opts) => {
    fastify.decorate($currencyWsSymbol, currencyWsHandler);
    fastify.register(connectionHandlerPlugin, { wss });
  }
);

export const getCurrencyWsHandler = (fastify: FastifyInstance) => {
  const handler = (fastify as any)[
    $currencyWsSymbol
  ] as typeof currencyWsHandler;
  return { handle: _.partial(handler, fastify) };
};

const currencyWsHandler = (
  fastify: FastifyInstance,
  request: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer
) => {
  const jwtSecretKey = _.get(getConfig(fastify), "jwt.cat1.secret_key");

  wss.handleUpgrade(request, socket, head, function done(ws) {
    // const token = request.headers.authorization?.split(" ")[1];
    // const parsedUser = jwt.parseUser(token, jwtSecretKey);
    // if (!parsedUser) {
    //   socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    //   socket.destroy();
    //   return;
    // }

    console.log("\n\n\nUpgrade Alert\n\n\n");
    console.log("request", request.headers, "\n\n");
    // console.log("socket", socket, "\n\n\n");
    // console.log("head", head, "\n\n\n");
    const parsedUser = { id: "ggg" };

    wss.emit("connection", ws, request, { user: parsedUser });
    // wss.emit("connection", ws, request, { user: { id: "2" } });
  });
};

export default currencyWsPlugin;
