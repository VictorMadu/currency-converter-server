import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { querySchema, res200Schema, reqHeaderSchema } from "./schemas";

export interface IReqData {
  userId: string;
}

export type IReqQuery = FromSchema<typeof querySchema>;

export type IReqHeaderParams = FromSchema<typeof reqHeaderSchema>;

export type IRes200 = FromSchema<typeof res200Schema>;

export type IRoute = {
  QueryString: IReqQuery;
  Headers: IReqHeaderParams;
};

export type IReq = FastifyRequest<IRoute>;

export type IRep = FastifyReply;
