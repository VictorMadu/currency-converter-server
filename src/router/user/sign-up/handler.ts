import { FastifyInstance } from "fastify";
import { getDbService } from "./db-service";
import { IRes201, Rep, Req } from "./_dtypes";
import * as _ from "lodash";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";

const handler = async (fastify: FastifyInstance, request: Req, reply: Rep) => {
  const result = await getDbService(fastify).addUser({
    email: _.get(getReqPayloadTransformed(request), "body.email") as string,
    pwd: _.get(getReqPayloadTransformed(request), "body.pwd") as string,
    phone: _.get(getReqPayloadTransformed(request), "body.phone") as string,
  });

  const res = {
    success: true,
    data: result,
  } as IRes201;

  return reply.code(201).send(res);
};

export default handler;
