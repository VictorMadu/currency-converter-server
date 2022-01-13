import { FastifyInstance } from "fastify";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";
import { getDbService } from "./db-service";
import { IReqQuery, IRes200, Rep, Req } from "./_dtypes";
import * as _ from "lodash";

const handler = async (fastify: FastifyInstance, request: Req, reply: Rep) => {
  const dbService = getDbService(fastify);
  const { base, currencies } = _.get(
    getReqPayloadTransformed(request),
    "query"
  ) as IReqQuery;

  const result = await dbService.getPrices({
    base: base ?? (await dbService.getBaseId()),
    currencies,
  });

  const res: IRes200 = {
    success: true,
    data: { currencies: result },
  };

  return reply.code(200).send(res);
};

export default handler;
