import { FastifyInstance } from "fastify";
import { getConfig } from "../../../config";
import { Pipe } from "../../../_utils";
import { getDbService } from "./db-service";
import * as _ from "lodash";
import {
  emailTransformer,
  phoneTransformer,
  pwdTransformer,
} from "./transformers";
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

  await emailValidator
    .setContext([onError, getDbService(fastify)])
    .run(request.body.email);

  await pwdValidator.setContext(onError).run(request.body.pwd);

  const transformedEmail = await emailTransformer.run(request.body.email);
  const transformedPhone = await phoneTransformer.run(request.body.phone);
  const transformedPwd = await pwdTransformer
    .setContext(_.get(getConfig(fastify), "bcrypt.salt_rounds"))
    .run(request.body.pwd);

  _.set(getReqPayloadTransformed(request), "body.email", transformedEmail);
  _.set(getReqPayloadTransformed(request), "body.phone", transformedPhone);
  _.set(getReqPayloadTransformed(request), "body.pwd", transformedPwd);
};

export default preHandler;
