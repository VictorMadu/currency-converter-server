import { FastifyInstance } from "fastify";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";
import { getDbService } from "./db-service";
import { IReqQuery, IRes200, Rep, Req } from "./_dtypes";
import * as _ from "lodash";
import { throwError } from "../../../_utils";

const handler = async (fastify: FastifyInstance, request: Req, reply: Rep) => {
  const dbService = getDbService(fastify);
  const { base, quota } = _.get(
    getReqPayloadTransformed(request),
    "query"
  ) as IReqQuery;

  const baseId = base === undefined ? base : await dbService.getBaseId();
  if (_.isUndefined(baseId)) {
    return throwError("base currency in 'currencies' in '__meta' is not found");
  }
  const result = await dbService.getPrices({
    base: baseId,
    currencies: quota,
  });

  const res: IRes200 = {
    success: true,
    data: {
      base: baseId,
      currencies: result,
    },
  };

  return reply.code(200).send(res);
};

export default handler;
