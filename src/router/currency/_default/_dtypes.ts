import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { res200Schema, querySchema } from "./schemas";

export type IReqQuery = FromSchema<typeof querySchema>;

export type Route = { Querystring: IReqQuery };

export type Req = FastifyRequest<Route>;

export type Rep = FastifyReply;

export type IRes200 = FromSchema<typeof res200Schema>;
