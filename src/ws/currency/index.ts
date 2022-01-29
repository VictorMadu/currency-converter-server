import fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { IncomingMessage } from "http";
import { getConfig } from "../../config";
import internal from "stream";
import { WebSocketServer } from "ws";
import * as jwt from "../../_utils/jwt";
import * as _ from "lodash";
import connectionHandlerPlugin from "./connection-handler";
import { ObjectId } from "mongodb";
import mongoPlugin from "../../db/mongo";
import { MONGO_KEY } from "./utils";

const $currencyWsSymbol = Symbol("currencyWsSymbol");
const wss = new WebSocketServer({ noServer: true });

const currencyWsPlugin: FastifyPluginAsync<{ prefix: string }> = fp(
  async (fastify, opts) => {
    fastify.register(mongoPlugin, { key: MONGO_KEY });
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
  head: Buffer,
  user: { id: ObjectId }
) => {
  try {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request, user);
    });
  } catch (error) {
    socket.destroy();
  }
};

export default currencyWsPlugin;
