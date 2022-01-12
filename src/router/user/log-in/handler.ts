import { FastifyInstance } from "fastify";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";
import { getDbService } from "./db-service";
import { Rep, Req } from "./_dtypes";
import * as _ from "lodash";
import { getConfig } from "../../../config";
const jwt = require("jsonwebtoken");

const handler = async (fastify: FastifyInstance, request: Req, reply: Rep) => {
  const dbService = getDbService(fastify);
  const result = await dbService.getUser(
    _.get(getReqPayloadTransformed(request), "body.email") as string
  );
  if (_.isUndefined(result)) return reply.code(200).send({ success: false });

  const secretKey = _.get(getConfig(fastify), "jwt.cat1.secret_key") as string;
  const expires = _.get(getConfig(fastify), "jwt.cat1.expires") as string;
  const token = signJWT(secretKey, expires, { id: result.id });
  return reply.code(200).send({
    success: true,
    data: _.set(result, "token", token),
  });
};

const signJWT = (secretKey: string, expires: string, payload: object) => {
  return jwt.sign(payload, secretKey, { expiresIn: expires });
};

export default handler;
