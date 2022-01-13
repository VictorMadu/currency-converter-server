import { FastifyInstance } from "fastify";
import { getDbService } from "./db-service";
import { IRes200, Rep, Req } from "./_dtypes";
import * as _ from "lodash";

const handler = async (fastify: FastifyInstance, request: Req, reply: Rep) => {
  const dbService = getDbService(fastify);
  const result = await dbService.listAllCurrencies();

  const res: IRes200 = {
    success: true,
    data: result,
  };
  return reply.code(200).send(res);
};

export default handler;
