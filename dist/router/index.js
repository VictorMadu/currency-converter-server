"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("./user");
const routerPlugin = async (fastify) => {
    fastify.register(user_1.default, { prefix: "/user" });
};
exports.default = routerPlugin;
