"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const router_1 = require("./router");
const app = (0, fastify_1.default)({ logger: true });
app.register(router_1.default, { prefix: "/api" });
app.listen(8080, "127.0.0.1", (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Server listening at", address);
});
