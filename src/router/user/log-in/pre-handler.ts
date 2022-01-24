import { FastifyInstance } from "fastify";
import { getConfig } from "../../../config";
import { Pipe } from "../../../_utils";
import { getDbService } from "./db-service";
import * as _ from "lodash";
import { emailTransformer } from "./transformers";
import { emailValidator, pwdValidator } from "./validators";
import { Req, Rep } from "./_dtypes";
import { onErrorOnPipe } from "../_utils/funcs";
import { getReqPayloadTransformed } from "../../../router/req-payload-transformed";

const preHandler = async (
  fastify: FastifyInstance,
  request: Req,
  reply: Rep
) => {
  const onError = _.partial(onErrorOnPipe, reply);

  // TODO: Decorate the request and attach the transformed bodies in here
  await emailValidator.setContext(onError).run(request.body.email);
  const emailTransformed = await emailTransformer.run(request.body.email);

  await pwdValidator
    .setContext([onError, getDbService(fastify), emailTransformed])
    .run(request.body.pwd);

  _.set(getReqPayloadTransformed(request), "body.email", emailTransformed);
};

export default preHandler;
