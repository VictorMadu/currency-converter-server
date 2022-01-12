import { FastifyInstance } from "fastify";
import { getDbService } from "./db-service";
import { Rep, Req } from "./_dtypes";
import * as _ from "lodash";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";

const handler = async (fastify: FastifyInstance, request: Req, reply: Rep) => {
  const result = await getDbService(fastify).addUser({
    email: _.get(getReqPayloadTransformed(request), "body.email") as string,
    pwd: _.get(getReqPayloadTransformed(request), "body.pwd") as string,
    phone: _.get(getReqPayloadTransformed(request), "body.phone") as string,
  });

  return reply.code(201).send({
    success: true,
    data: result,
  });
};

export default handler;
