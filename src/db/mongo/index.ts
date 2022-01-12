import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import decorator from "./_decorator";
import { IOpts, IMongo } from "./_dtypes";

const $mongo = Symbol("mongo");

const mongoPlugin: FastifyPluginAsync<IOpts> = fp(async function (
  fastify,
  opts
) {
  const map = (fastify as any)[$mongo] ?? new Map();

  if (!map.has(opts.key)) {
    const mongoInstance = await decorator(fastify, opts.key);
    map.set(opts.key, mongoInstance);
  }

  fastify.decorate($mongo, map);
});

export const getMongo = (fastify: FastifyInstance, key: string) =>
  (fastify as any)[$mongo].get(key) as IMongo;

export default mongoPlugin;
