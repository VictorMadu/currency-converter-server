import { FastifyPluginAsync } from "fastify";
import * as _ from "lodash";
import dbServicePlugin from "./db-service";
import handler from "./handler";
import { res200Schema } from "./schemas";
import { Route } from "./_dtypes";

const listCurrenciesPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(dbServicePlugin);
  fastify.get<Route>(
    "",
    {
      schema: {
        response: {
          "200": res200Schema,
        },
      },
    },
    _.partial(handler, fastify)
  );
};

export default listCurrenciesPlugin;
