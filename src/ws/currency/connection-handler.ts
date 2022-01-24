import { FastifyPluginAsync } from "fastify";
import { IncomingMessage } from "http";
import { ObjectId } from "mongodb";
import { IParsedUser } from "../../_utils/jwt";
import { WebSocketServer, WebSocket } from "ws";
import wsEventEmitter from "../event-emitter";

const connectionHandlerPlugin: FastifyPluginAsync<{
  wss: WebSocketServer;
}> = async (fastify, opts) => {
  fastify.addHook("onReady", () =>
    console.log("Currency connection handler attached")
  );
  const wss = opts.wss;
  wss.on(
    "connection",
    (
      ws: WebSocket,
      request: IncomingMessage,
      { user }: { user: IParsedUser }
    ) => {
      ws.on("message", (payload: Buffer | string) => {
        let processedPayload =
          payload instanceof Buffer ? payload.toString() : payload;
        console.log("processedPayload string", processedPayload);
        processedPayload = JSON.parse(processedPayload);
        console.log("/n/n/n message", processedPayload);

        const res = {
          type: "price-update",
          data: processedPayload,
        };
        ws.send(JSON.stringify(res));
        // switch (payload.type) {
        //   case "price-update":
        //     //  TODO: Implement
        //     throw new Error("Not implemented");

        //   case "price-update":
        //     wsEventEmitter.on(
        //       "notify-alert-triggered-user-app__" + user.id,
        //       (payload: { data: { userId: ObjectId; msg: string } }) => {
        //         ws.send({ type: "price-update", data: payload.data.msg });
        //       }
        //     );
        // }
      });
    }
  );
};

export default connectionHandlerPlugin;
