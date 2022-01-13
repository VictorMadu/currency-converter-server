import { FastifyPluginAsync } from "fastify";
import dbServicePlugin from "./db-service";
import * as _ from "lodash";
import handler from "./handler";
import { bodySchema, res201Schema } from "./schemas";
import preHandler from "./pre-handler";
import { Route } from "./_dtypes";

const signUpPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);
  // fastify.register()

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
    // TODO: Make all handlers and preHandlers plugins and inject dependencies in all of them. Do this for everything, inject them dependencies. Compare the difference in performance
    _.partial(handler, fastify)
  );
  fastify.addHook("preHandler", _.partial(preHandler, fastify));
};

export default signUpPlugin;
