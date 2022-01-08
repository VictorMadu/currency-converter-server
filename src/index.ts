import Fastify from "fastify";
import routerPlugin from "./router";

const app = Fastify({ logger: true });

app.register(routerPlugin, { prefix: "/api" });

app.listen(8080, "127.0.0.1", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log("Server listening at", address);
});
