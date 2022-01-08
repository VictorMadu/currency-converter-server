"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const fastify = (0, fastify_1.default)({ logger: true });
fastify.get("/ping", async (request, reply) => {
    fastify.log.info("testing");
    return "pong\n";
});
exports.default = fastify;
