import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { bodySchema, paramsSchema, reqHeaderSchema } from "./schemas";

export type IReqBody = FromSchema<typeof bodySchema>;

export type IReqParams = FromSchema<typeof paramsSchema>;

export type IReqHeaderParams = FromSchema<typeof reqHeaderSchema>;

export type IRoute = {
  Body: IReqBody;
  Params: IReqParams;
  Headers: IReqHeaderParams;
};
