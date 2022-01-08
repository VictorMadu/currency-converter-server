"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userPlugin = async (fastify) => {
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
exports.default = userPlugin;
