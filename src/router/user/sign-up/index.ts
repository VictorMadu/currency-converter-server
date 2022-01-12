import { FastifyPluginAsync } from "fastify";
import dbServicePlugin from "./db-service";
import * as _ from "lodash";
import handler from "./handler";
import { bodySchema, res201Schema } from "./schemas";
import preHandler from "./pre-handler";
import { Route } from "./_dtypes";

const signUpPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);

  fastify.post<Route>(
    "",
    {
      schema: {
        response: {
          "200": res201Schema,
        },
        body: bodySchema,
      },
    },
    _.partial(handler, fastify)
  );
  fastify.addHook("preHandler", _.partial(preHandler, fastify));
};

export default signUpPlugin;
