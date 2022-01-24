import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { res200Schema } from "./schemas";

export type IRes200 = FromSchema<typeof res200Schema>;

export type Route = {};

export type Req = FastifyRequest<Route>;

export type Rep = FastifyReply;
