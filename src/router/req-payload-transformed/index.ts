import {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";
import fp from "fastify-plugin";

export type IResPayloadTransformed = Record<string, any>;

const $payloadTransform = Symbol("req payload transform");

const reqPayloadTransformedPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.decorateRequest($payloadTransform, null);
  fastify.addHook(
    "onRequest",
    (
      request: FastifyRequest,
      reply: FastifyReply,
      done: HookHandlerDoneFunction
    ) => {
      (request as any)[$payloadTransform] = {};
      done();
    }
  );
});

export const getReqPayloadTransformed = (request: FastifyRequest) => {
  const e = (request as any)[$payloadTransform] as IResPayloadTransformed;

  return e;
};

export default reqPayloadTransformedPlugin;
