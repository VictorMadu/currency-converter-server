import fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { getMongo } from "../../../../db/mongo";
import { MONGO_KEY } from "../../../../router/_constants";

import Service from "./_service";

const $dbService = Symbol("dbService");

const dbServicePlugin: FastifyPluginAsync = fp(async (fastify) => {
  const mongo = getMongo(fastify, MONGO_KEY);
  fastify.decorate($dbService, new Service(mongo));
});

export const getDbService = (fastify: FastifyInstance): Service =>
  (fastify as any)[$dbService];

export default dbServicePlugin;
