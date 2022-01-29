import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getConfig } from "../../../config";
import { Pipe } from "../../../_utils";
import * as _ from "lodash";
import { IReqBody, IReqData, IReqQuery, IRoute } from "./_dtypes";
import { headerAuthTransformer } from "./transformers";
import { getReqPayloadTransformed } from "../../req-payload-transformed";
import * as jwt from "../../../_utils/jwt";

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
  const user = (await headerAuthTransformer
    .setContext([jwtSecretKey, onForbiddenError])
    .run(request.headers.authorization)) as jwt.IParsedUser;

  _.set(getReqPayloadTransformed(request), "query", request.query) as IReqQuery;

  _.set(getReqPayloadTransformed(request), "body", request.body) as IReqBody;
  _.set(getReqPayloadTransformed(request), "data", {
    userId: user.id,
    userEmail: user.email,
  }) as IReqData;
};

export default preHandler;
