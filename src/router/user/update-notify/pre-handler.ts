import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getConfig } from "../../../config";
import { Pipe } from "../../../lib";
import * as _ from "lodash";
import { IReqBody, IRoute } from "./_dtypes";
import { headerAuthTransformer } from "./transformers";
import { paramIdValidator } from "./validators";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";

const preHandler = async (
  fastify: FastifyInstance,
  request: FastifyRequest<IRoute>,
  reply: FastifyReply
) => {
  const onForbiddenError = (errMsg?: string) => {
    reply.code(403).send(errMsg ?? "Not authorized");
    return Pipe.END;
  };

  const jwtSecretKey = _.get(getConfig(fastify), "jwt.cat1.secret_key");
  const userId = await headerAuthTransformer
    .setContext([jwtSecretKey, onForbiddenError])
    .run(request.headers.authorization);

  await paramIdValidator
    .setContext([userId, onForbiddenError])
    .run(request.params.userId);

  _.set(getReqPayloadTransformed(request), "body", request.body) as IReqBody;
  // _.set(getReqPayloadTransformed(request), "body.phone", transformedPhone);
  // _.set(getReqPayloadTransformed(request), "body.pwd", transformedPwd);
};

export default preHandler;
