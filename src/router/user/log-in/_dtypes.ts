import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { bodySchema, querySchema, res200Schema } from "./schemas";

export type IReqQuery = FromSchema<typeof querySchema>;

export type IReqBody = FromSchema<typeof bodySchema>;

export type IRoute = { Body: IReqBody; Querystring: IReqQuery };

export type IReq = FastifyRequest<IRoute>;

export type IRep = FastifyReply;

export type IRes200 = FromSchema<typeof res200Schema>;
