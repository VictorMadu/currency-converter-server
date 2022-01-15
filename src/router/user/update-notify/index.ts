import { FastifyPluginAsync } from "fastify";
import * as _ from "lodash";
import dbServicePlugin from "./db-service";
import handler from "./handler";
import preHandler from "./pre-handler";
import { res201Schema, bodySchema, reqHeaderSchema } from "./schemas";

const updateNotifyPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);

  fastify.put(
    "",
    {
      schema: {
        response: {
          "201": res201Schema,
        },
        body: bodySchema,
        headers: reqHeaderSchema,
      },
    },
    _.partial(handler, fastify)
  );

  fastify.addHook("preHandler", _.partial(preHandler, fastify));
};

export default updateNotifyPlugin;
