import { FastifyReply, FastifyRequest } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { bodySchema, reqHeaderSchema } from "./schemas";

export type IReqBody = FromSchema<typeof bodySchema>;

export interface IReqData {
  userId: string;
}

export type IReqHeaderParams = FromSchema<typeof reqHeaderSchema>;

export type IRoute = {
  Body: IReqBody;
  Headers: IReqHeaderParams;
};
