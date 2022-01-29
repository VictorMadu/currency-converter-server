import fastify from "fastify";
import routerPlugin from "./router";
import configPlugIn from "./config";
import * as fs from "fs";
import * as path from "path";
import pino from "pino";
import wsPlugin from "./ws";
import cronPlugin from "./cron";
import * as yaml from "js-yaml";
import * as _ from "lodash";

const configFile = fs.readFileSync(
  path.join(
    process.cwd(),
    process.env.NODE_ENV === "test" ? "config.test.yaml" : "config.yaml"
  ),
  { encoding: "utf-8" }
);

const yamlLoadedConfigFile = yaml.load(configFile) as Record<string, any>;
console.log("\n\n", yamlLoadedConfigFile, "\n\n");

const KEY = fs.readFileSync(
  path.join(_.get(yamlLoadedConfigFile, "app.key") as string)
);
const CERT = fs.readFileSync(
  path.join(_.get(yamlLoadedConfigFile, "app.cert") as string)
);
const ADDRESS = _.get(yamlLoadedConfigFile, "app.address") as string;
const PORT = _.get(yamlLoadedConfigFile, "app.port") as number;

const app = fastify({
  https: {
    key: KEY,
    cert: CERT,
  },
  logger: pino(
    { level: "debug" },
    pino.multistream([
      { stream: fs.createWriteStream(path.join(process.cwd(), "debug.log")) },
      { level: "debug", stream: process.stdout },
    ])
  ),
});

app.register(configPlugIn);
app.register(routerPlugin, { prefix: "/api" });
app.register(wsPlugin);
app.register(cronPlugin);
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

app.listen(PORT, ADDRESS, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log("Server listening at", address);
});
