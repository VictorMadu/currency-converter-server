import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";
import { getDbService } from "./db-service";
import * as _ from "lodash";
import { IReqBody, IRoute } from "./_dtypes";
import { NonEmptyArray } from "../../../dtypes";

const handler = async (
  fastify: FastifyInstance,
  request: FastifyRequest<IRoute>,
  reply: FastifyReply
) => {
  const dbService = getDbService(fastify);
  const { action, notifyOptions } = _.get(
    getReqPayloadTransformed(request),
    "body"
  ) as IReqBody;

  console.log(getReqPayloadTransformed(request));

  const result = await dbService.updateNotify(request.params.userId, {
    action,
    notifyOptions: notifyOptions as NonEmptyArray<"app" | "phone" | "email">,
  });
  return reply.code(201).send({ success: result });
};

export default handler;
