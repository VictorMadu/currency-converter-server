import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync } from "fastify";

const $config = Symbol("config");

const configPlugIn: FastifyPluginAsync = fp(async function (fastify, opts) {
  fastify.decorate($config, await config());
});

const config = async () => {
  const ENCODING = "utf-8";
  const configFile = await fs.promises.readFile(
    path.join(process.cwd(), getConfigFileName()),
    { encoding: ENCODING }
  );
  return yaml.load(configFile) as Record<string, any>;
};

function getConfigFileName() {
  switch (process.env.NODE_ENV) {
    case "test":
      return "config.test.yaml";
    default:
      return "config.yaml";
  }
}

export const getConfig = (fastify: FastifyInstance) =>
  (fastify as any)[$config] as Record<string, any>;

export default configPlugIn;
