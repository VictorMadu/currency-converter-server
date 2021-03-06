import { FastifyPluginAsync } from "fastify";
import * as _ from "lodash";
import dbServicePlugin from "./db-service";
import handler from "./handler";
import preHandler from "./pre-handler";
import { res200Schema, bodySchema, querySchema } from "./schemas";
import { IRoute } from "./_dtypes";

const loginInPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);
  fastify.post<IRoute>(
    "",
    {
      schema: {
        response: {
          "200": res200Schema,
        },
        querystring: querySchema,
        body: bodySchema,
      },
    },
    _.partial(handler, fastify)
  );
  fastify.addHook("preHandler", _.partial(preHandler, fastify));
};

export default loginInPlugin;
