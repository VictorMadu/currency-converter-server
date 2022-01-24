import { FastifyPluginAsync } from "fastify";
import * as _ from "lodash";
import dbServicePlugin from "./db-service";
import handler from "./handler";
import preHandler from "./pre-handler";
import { res200Schema, querySchema } from "./schemas";
import { Route } from "./_dtypes";

const getPricesPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);
  fastify.get<Route>(
    "",
    {
      schema: {
        response: {
          "200": res200Schema,
        },
        querystring: querySchema,
      },
    },
    _.partial(handler, fastify)
  );
  fastify.addHook("preHandler", _.partial(preHandler, fastify));
};

export default getPricesPlugin;
