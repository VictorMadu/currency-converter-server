import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { bodySchema, res201Schema } from "./schemas";

export type IReqBody = FromSchema<typeof bodySchema>;

export type IRes201 = FromSchema<typeof res201Schema>;

export type Route = { Body: IReqBody };

export type Req = FastifyRequest<Route>;

export type Rep = FastifyReply;

export type Ctx = {
  request: Req;
  reply: FastifyReply;
};
