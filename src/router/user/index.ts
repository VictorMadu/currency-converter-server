import { FastifyPluginAsync } from "fastify";

const userPlugin: FastifyPluginAsync<{ prefix: string }> = async (fastify) => {
  fastify.get("", {
    handler: async () => "Hello world",
    schema: {
      response: {
        "2xx": {
          type: "string",
        },
      },
    },
  });
};

export default userPlugin;
