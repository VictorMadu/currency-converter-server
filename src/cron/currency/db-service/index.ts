import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { MONGO_KEY } from "../../utils";
import { getMongo } from "../../../db/mongo";
import DbService from "./_service";

const $dbService = Symbol("dbService");

const dbServicePlugin: FastifyPluginAsync = fp(async (fastify) => {
  const mongo = getMongo(fastify, MONGO_KEY);
  fastify.decorate($dbService, new DbService(mongo));
});

export const getDbService = (fastify: FastifyInstance): DbService =>
  (fastify as any)[$dbService];

export default dbServicePlugin;
