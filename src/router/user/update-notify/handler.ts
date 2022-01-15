import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";
import { getDbService } from "./db-service";
import * as _ from "lodash";
import { IReqBody, IReqData, IRoute } from "./_dtypes";
import { NonEmptyArray } from "../../../dtypes";

const handler = async (
  fastify: FastifyInstance,
  request: FastifyRequest<IRoute>,
  reply: FastifyReply
) => {
  const dbService = getDbService(fastify);

  const data = _.get(getReqPayloadTransformed(request), "data") as IReqData;

  const body = _.get(getReqPayloadTransformed(request), "body") as IReqBody;

  const result = await dbService.updateNotify(data.userId, {
    action: body.action,
    notifyOptions: body.notifyOptions as NonEmptyArray<
      "app" | "phone" | "email"
    >,
  });
  return reply.code(201).send({ success: result });
};

export default handler;
