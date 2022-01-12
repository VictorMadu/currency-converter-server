import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { bodySchema } from "./schemas";

export type IReqBody = FromSchema<typeof bodySchema>;

export type Route = { Body: IReqBody };

export type Req = FastifyRequest<Route>;

export type Rep = FastifyReply;

export type Ctx = {
  request: Req;
  reply: FastifyReply;
};
