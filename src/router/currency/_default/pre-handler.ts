import { FastifyInstance } from "fastify";
import * as _ from "lodash";
import { Req, Rep } from "./_dtypes";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";

const preHandler = async (
  fastify: FastifyInstance,
  request: Req,
  reply: Rep
) => {
  _.set(getReqPayloadTransformed(request), "query", request.query);
};

export default preHandler;
