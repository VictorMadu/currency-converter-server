import { FastifyPluginAsync } from "fastify";
import dbServicePlugin from "./db-service";
import * as _ from "lodash";
import handler from "./handler";
import { querySchema, res200Schema, reqHeaderSchema } from "./schemas";
import preHandler from "./pre-handler";
import { IRoute } from "./_dtypes";

const getAlertsPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);

  fastify.get<IRoute>(
    "",
    {
      schema: {
        response: {
          "200": res200Schema,
        },
        headers: reqHeaderSchema,
        querystring: querySchema,
      },
    },
    // TODO: Make all handlers and preHandlers plugins and inject dependencies in all of them. Do this for everything, inject them dependencies. Compare the difference in performance
    _.partial(handler, fastify)
  );
  fastify.addHook("preHandler", _.partial(preHandler, fastify));
};

export default getAlertsPlugin;
