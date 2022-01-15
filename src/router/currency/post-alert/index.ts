import { FastifyPluginAsync } from "fastify";
import dbServicePlugin from "./db-service";
import * as _ from "lodash";
import handler from "./handler";
import { bodySchema, res200Schema, reqHeaderSchema } from "./schemas";
import preHandler from "./pre-handler";
import { IRoute } from "./_dtypes";

const postAlertPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);

  fastify.post<IRoute>(
    "",
    {
      schema: {
        response: {
          "200": res200Schema,
        },
        headers: reqHeaderSchema,
        body: bodySchema,
      },
    },
    _.partial(handler, fastify)
  );
  fastify.addHook("preHandler", _.partial(preHandler, fastify));
};

export default postAlertPlugin;
