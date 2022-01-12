import { FastifyPluginAsync } from "fastify";
import * as _ from "lodash";
import dbServicePlugin from "./db-service";
import handler from "./handler";
import preHandler from "./pre-handler";
import { res201Schema, bodySchema } from "./schemas";
import { Route } from "./_dtypes";

const loginInPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);
  fastify.post<Route>(
    "",
    {
      schema: {
        response: {
          "201": res201Schema,
        },
        body: bodySchema,
      },
    },
    _.partial(handler, fastify)
  );
  fastify.addHook("preHandler", _.partial(preHandler, fastify));
};

export default loginInPlugin;
