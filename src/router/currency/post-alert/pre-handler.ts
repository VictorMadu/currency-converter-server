import { FastifyInstance } from "fastify";
import { getConfig } from "../../../config";
import { Pipe } from "../../../lib";
import { getDbService } from "./db-service";
import * as _ from "lodash";
import { IReq, IRep, IReqBody, IReqData } from "./_dtypes";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";
import { headerAuthTransformer } from "../../../router/user/update-notify/transformers";

const preHandler = async (
  fastify: FastifyInstance,
  request: IReq,
  reply: IRep
) => {
  const onForbiddenError = (errMsg?: string) => {
    reply.code(403).send(errMsg ?? "Not authorized");
    return Pipe.END;
  };

  const jwtSecretKey = _.get(getConfig(fastify), "jwt.cat1.secret_key");
  const userId = await headerAuthTransformer
    .setContext([jwtSecretKey, onForbiddenError])
    .run(request.headers.authorization);

  _.set(getReqPayloadTransformed(request), "body", request.body) as IReqBody;
  _.set(getReqPayloadTransformed(request), "data", { userId }) as IReqData;
};

export default preHandler;
