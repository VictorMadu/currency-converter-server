import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { bodySchema, querySchema, res200Schema } from "./schemas";

export type IReqQuery = FromSchema<typeof querySchema>;

export type IReqBody = FromSchema<typeof bodySchema>;

export type IRes200 = FromSchema<typeof res200Schema>;

export type IRoute = { Body: IReqBody; Querystring: IReqQuery };

export type Req = FastifyRequest<IRoute>;

export type Rep = FastifyReply;

export type Ctx = {
  request: Req;
  reply: FastifyReply;
};

export interface IReqData {
  userId: string;
  userEmail: string;
}
