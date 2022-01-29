import { FastifyInstance } from "fastify";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";
import { getDbService } from "./db-service";
import { IRep, IReq, IReqQuery, IRes200 } from "./_dtypes";
import * as _ from "lodash";
import { getConfig } from "../../../config";
import * as jwt from "../../../_utils/jwt";

const handler = async (
  fastify: FastifyInstance,
  request: IReq,
  reply: IRep
) => {
  const reqEmail = _.get(
    getReqPayloadTransformed(request),
    "body.email"
  ) as string;

  const reqIncludeNotify = _.get(
    getReqPayloadTransformed(request),
    "query.notify_opts"
  ) as IReqQuery["notify_opts"];
  const reqIncludeTheme = _.get(
    getReqPayloadTransformed(request),
    "query.theme"
  ) as IReqQuery["theme"];

  const result = await getDbService(fastify).getUser(reqEmail, {
    includeId: true,
    includeEmail: true,
    includePhone: true,
    includeNotify: reqIncludeNotify === "1",
    includeTheme: reqIncludeTheme === "1",
  });
  if (_.isUndefined(result)) return reply.code(200).send({ success: false });

  const secretKey = _.get(getConfig(fastify), "jwt.cat1.secret_key") as string;
  const expires = _.get(getConfig(fastify), "jwt.cat1.expires") as string;

  // TODO: Check a better status code
  if (!(result.id && result.email))
    return reply.code(400).send("Cannot retrieve user");
  const token = jwt.signUser(secretKey, expires, {
    id: result.id,
    email: result.email,
  });

  const res = {
    success: true,
    data: _.set(result, "token", token) as typeof result & { token: string },
  } as IRes200;
  return reply.code(200).send(res);
};

export default handler;
