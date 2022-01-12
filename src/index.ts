import Fastify from "fastify";
import routerPlugin from "./router";
import configPlugIn from "./config";
import * as fs from "fs";
import * as path from "path";

const app = Fastify({
  logger: {
    stream: fs.createWriteStream(path.join(process.cwd(), "debug.log")),
  },
});

app.register(configPlugIn);
app.register(routerPlugin, { prefix: "/api" });

app.listen(8080, "127.0.0.1", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log("Server listening at", address);
});
