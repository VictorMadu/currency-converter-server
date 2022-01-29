import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getReqPayloadTransformed } from "../../req-payload-transformed";
import { getDbService } from "./db-service";
import * as _ from "lodash";
import { IReqBody, IReqData, IReqQuery, IRes200, IRoute } from "./_dtypes";
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
  if (body.notify_opts && body.notify_action) {
    const notifyResult = await dbService.updateNotify(data.userId, {
      action: body.notify_action,
      notifyOptions: body.notify_opts as NonEmptyArray<
        "app" | "phone" | "email"
      >,
    });

    modifiedCount += +notifyResult;
  }

  if (body.theme) {
    const themeResult = await dbService.updateTheme(data.userId, {
      theme: body.theme,
    });
    modifiedCount += +themeResult;
  }

  const query = _.get(getReqPayloadTransformed(request), "query") as IReqQuery;
  const userEmail = _.get(
    getReqPayloadTransformed(request),
    "data.userEmail"
  ) as IReqData["userEmail"];

  let user:
    | undefined
    | {
        notify_opts?: ("app" | "email" | "phone")[];
        app_theme?: "light" | "dark";
      };
  if (query.notify_opts || query.theme) {
    user = await dbService.getUser(userEmail, {
      includeNotify: query.notify_opts === "1",
      includeTheme: query.theme === "1",
    });
  }

  const res = {
    success: true,
    data: {
      modifiedCount,
      user,
    },
  } as IRes200;

  return reply.code(200).send(res);
};

export default handler;
