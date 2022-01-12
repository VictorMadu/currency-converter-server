import { FastifyInstance, FastifyReply } from "fastify";
import { Pipe } from "../../../lib";

export const onErrorOnPipe = (reply: FastifyReply, errMsg: string) => {
  reply.code(400).send(errMsg);
  return Pipe.END;
};
