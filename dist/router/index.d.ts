import { FastifyPluginAsync } from "fastify";
declare const routerPlugin: FastifyPluginAsync<{
    prefix: string;
}>;
export default routerPlugin;
