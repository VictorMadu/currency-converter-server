import { FastifyPluginAsync } from "fastify";
declare const userPlugin: FastifyPluginAsync<{
    prefix: string;
}>;
export default userPlugin;
