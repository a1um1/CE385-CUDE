import createClient from "openapi-fetch";
import type { paths } from "./openapi";

export const APIclient = createClient<paths>({ baseUrl: "http://localhost:3000" });
