import { FastifyInstance } from "fastify";
import { getConfig } from "../../../config";
import { Pipe } from "../../../_utils";
import { getDbService } from "./db-service";
import * as _ from "lodash";
import { IReq, IRep, IReqData } from "./_dtypes";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";
import { headerAuthTransformer } from "../../user/settings/transformers";
import * as jwt from "../../../_utils/jwt";

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
  const user = (await headerAuthTransformer
    .setContext([jwtSecretKey, onForbiddenError])
    .run(request.headers.authorization)) as jwt.IParsedUser;

  _.set(getReqPayloadTransformed(request), "data", {
    userId: user.id,
  }) as IReqData;
};

export default preHandler;
