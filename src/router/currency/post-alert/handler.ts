import { FastifyInstance } from "fastify";
import { getDbService } from "./db-service";
import { IRep, IReq, IReqBody, IReqData } from "./_dtypes";
import * as _ from "lodash";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";

const handler = async (
  fastify: FastifyInstance,
  request: IReq,
  reply: IRep
) => {
  const data = _.get(getReqPayloadTransformed(request), "data") as IReqData;
  const body = _.get(getReqPayloadTransformed(request), "body") as IReqBody;

  const quotaCurrRate = await getDbService(fastify).getCurrencyPrice({
    short: body.quota,
  });

  if (quotaCurrRate == null) return reply.code(200).send({ success: false });

  const isSuccessful = await getDbService(fastify).addAlert({
    quota: body.quota,
    quotaCurRate: quotaCurrRate,
    base: body.base,
    userId: data.userId,
    targetRate: body.target_rate,
  });

  return reply.code(200).send({ success: isSuccessful });
};

export default handler;
