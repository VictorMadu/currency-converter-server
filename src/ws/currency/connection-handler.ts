import { FastifyPluginAsync } from "fastify";
import { IncomingMessage } from "http";
import { ObjectId } from "mongodb";
import { WebSocketServer, WebSocket } from "ws";
import wsEventEmitter from "../event-emitter";
import dbServicePlugin, { getDbService } from "./db-service";
import * as _ from "lodash";
import mongoPlugin from "../../db/mongo";
import { MONGO_KEY } from "./utils";

const connectionHandlerPlugin: FastifyPluginAsync<{
  wss: WebSocketServer;
}> = async (fastify, { wss }) => {
  fastify.register(dbServicePlugin);
  const connectedUsers = new Map<
    string,
    // ws, base, quotas
    [WebSocket, string | undefined, string[] | undefined]
  >();

  fastify.addHook("onReady", () =>
    console.log("Currency connection handler attached")
  );
  wss.on(
    "connection",
    (ws: WebSocket, request: IncomingMessage, user: { id: ObjectId }) => {
      connectedUsers.set(user.id.toString(), [ws, undefined, undefined]);
      ws.send(JSON.stringify({ type: "connected" }));

      ws.on("message", (payload: string | Buffer) => {
        const stringifiedPayload =
          payload instanceof Buffer ? payload.toString() : payload;
        const parsedPayload = JSON.parse(stringifiedPayload) as {
          type: "price-update-settings";
          data: { base?: string; quotas?: string[] };
        };

        const userId = user.id.toString();
        const connectedUser = connectedUsers.get(userId);
        if (!connectedUser) return; // TODO: Its an error. Log this
        const [ws, prevBase, prevQuotas] = connectedUser;

        switch (parsedPayload.type) {
          case "price-update-settings":
            const { base, quotas } = parsedPayload.data;
            connectedUsers.set(userId, [
              ws,
              base ?? prevBase,
              quotas ?? prevQuotas,
            ]);
            return ws.send(
              JSON.stringify({
                type: "price-update-settings",
                data: { success: true },
              })
            );
          default:
            return ws.send(
              JSON.stringify({
                type: "UNKNOWN",
                data: { success: false },
              })
            );
        }
      });
      wss.on("close", () => connectedUsers.delete(user.id.toString()));
    }
  );

  wsEventEmitter.on(
    "notify-alert-triggered-user-app",
    (payload: {
      alertId: ObjectId;
      userId: ObjectId;
      msg: string;
      base: string;
      quota: string;
      triggeredTime: Date;
    }) => {
      console.log("Got Notifying app about app", payload);
      const connectedUser = connectedUsers.get(payload.userId.toString());
      if (!connectedUser) return; // TODO: Its an error. Log this
      const [ws] = connectedUser;
      console.log("Got connected ws", ws);

      ws.send(
        JSON.stringify({
          type: "price-alert",
          data: {
            alertId: payload.alertId.toString(),
            msg: payload.msg,
            base: payload.base,
            quota: payload.quota,
            triggeredTime: payload.triggeredTime,
          },
        })
      );
      console.log("Sent ws");
    }
  );

  wsEventEmitter.on("price-update", () => {
    connectedUsers.forEach(async ([ws, base, quotas]) => {
      const dbService = getDbService(fastify);
      const baseId = base ?? (await dbService.getBaseId());
      if (_.isUndefined(baseId))
        return fastify.log.error(
          new Error("base currency in 'currencies' in '__meta' is not found")
        );
      const result = await dbService.getPrices({
        base: baseId,
        currencies: quotas,
      });

      ws.send(
        JSON.stringify({
          type: "price-update",
          data: {
            base: baseId,
            currencies: result,
          },
        })
      );
    });
  });
};

export default connectionHandlerPlugin;
