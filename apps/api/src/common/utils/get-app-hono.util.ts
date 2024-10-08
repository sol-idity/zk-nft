import { OpenAPIHono } from "@hono/zod-openapi";
import { Bindings } from "../types/bindings";
import { Variables } from "../types/variables";

export const getAppHono = () =>
  new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();
