import { FastifyInstance } from "fastify";
import { getDbService } from "./db-service";
import { IRes200, IRep, IReq, IReqQuery, IReqData } from "./_dtypes";
import * as _ from "lodash";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";

const handler = async (
  fastify: FastifyInstance,
  request: IReq,
  reply: IRep
) => {
  const data = _.get(getReqPayloadTransformed(request), "data") as IReqData;
  const query = _.get(getReqPayloadTransformed(request), "query") as IReqQuery;

  const result = await getDbService(fastify).getAlerts({
    userId: data.userId,
    bases: query.bases,
    quotas: query.quotas,
    type: query.type,
  });

  console.log("\n\nRESULT:", JSON.stringify(result));

  const res = {
    success: true,
    data: result,
  } as IRes200;

  return reply.code(200).send(res);
};

export default handler;
