import { FastifyInstance } from "fastify";
import { getDbService } from "./db-service";
import { IRep, IReq, IReqData, IRes200 } from "./_dtypes";
import * as _ from "lodash";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";
import * as crypto from "crypto";

const handler = async (
  fastify: FastifyInstance,
  request: IReq,
  reply: IRep
) => {
  const data = _.get(getReqPayloadTransformed(request), "data") as IReqData;
  const ip = request.socket.remoteAddress;
  if (!ip) return reply.code(200).send({ success: false } as IRes200);
  const isSuccessful = await getDbService(fastify).generateTicket({
    id: data.userId,
    ip,
    ttl: 100,
  });

  return reply.code(200).send({ success: isSuccessful } as IRes200);
};

export default handler;
