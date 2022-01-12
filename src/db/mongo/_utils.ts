import { MongoClient } from "mongodb";
import { IMongoConfig } from "./_dtypes";

export class MongoService {
  private mongoClient!: MongoClient;
  constructor(private mongoConfig: IMongoConfig) {
    // this.db = this.db.bind(this);
    // this.col = this.col.bind(this);
    // this.connect = this.connect.bind(this);
    // this.db = this.db.bind(this);
    // this.db = this.db.bind(this);
    // this.db = this.db.bind(this);
  }

  db = () => {
    const dbName: string = this.mongoConfig.name;
    return this.mongoClient.db(dbName);
  };

  col = (name: string) => {
    return this.db().collection(name);
  };

  connect = async () => {
    this.mongoClient = new MongoClient(this.getUri());
    await this.mongoClient.connect();
  };

  ping = async () => {
    await this.mongoClient.db("admin").command({ ping: 1 });
  };

  close = async () => {
    await this.mongoClient.close();
  };

  private getUri = () => {
    const { address, port, poolsize } = this.mongoConfig;
    return (
      "mongodb://" + address + ":" + port + "/?maxPoolSize=" + poolsize ??
      1 + "&w=majority"
    );
  };
}
