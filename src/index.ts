import fastify from "fastify";
import routerPlugin from "./router";
import configPlugIn from "./config";
import * as fs from "fs";
import * as path from "path";
import pino from "pino";

const app = fastify({
  logger: pino(
    { level: "debug" },
    pino.multistream([
      { stream: fs.createWriteStream(path.join(process.cwd(), "debug.log")) },
      { level: "error", stream: process.stdout },
    ])
  ),
});

app.register(configPlugIn);
app.register(routerPlugin, { prefix: "/api" });
app.ready(() => {
  console.log("\nPrinting the plugins");
  console.log(app.printPlugins());
});
app.ready(() => {
  console.log("\nPrinting the routes");
  console.log(
    app.printRoutes({
      includeHooks: true,
      includeMeta: ["metaProperty"],
      commonPrefix: false,
    })
  );
});

app.listen(8080, "127.0.0.1", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log("Server listening at", address);
});
