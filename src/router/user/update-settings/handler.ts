import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getReqPayloadTransformed } from "../../req-payload-transformed";
import { getDbService } from "./db-service";
import * as _ from "lodash";
import { IReqBody, IReqData, IRes201, IRoute } from "./_dtypes";
import { NonEmptyArray } from "../../../dtypes";

const handler = async (
  fastify: FastifyInstance,
  request: FastifyRequest<IRoute>,
  reply: FastifyReply
) => {
  const dbService = getDbService(fastify);

  const data = _.get(getReqPayloadTransformed(request), "data") as IReqData;

  const body = _.get(getReqPayloadTransformed(request), "body") as IReqBody;

  let modifiedCount = 0;
  let success = true;

  if (body.notify_opts && body.notify_action) {
    const notifyResult = await dbService.updateNotify(data.userId, {
      action: body.notify_action,
      notifyOptions: body.notify_opts as NonEmptyArray<
        "app" | "phone" | "email"
      >,
    });

    modifiedCount += +notifyResult;
    !notifyResult && (success = false);
  }

  if (body.theme) {
    const themeResult = await dbService.updateTheme(data.userId, {
      theme: body.theme,
    });
    modifiedCount += +themeResult;
    !themeResult && (success = false);
  }

  const res = {
    success,
    data: {
      modifiedCount,
    },
  } as IRes201;

  return reply.code(201).send(res);
};

export default handler;
