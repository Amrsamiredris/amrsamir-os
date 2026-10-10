import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
import { keystaticEnabled } from "@/lib/keystatic-enabled";

const off = () => new Response("Not found", { status: 404 });
// Only build the handler when GitHub mode is fully configured, so a missing secret can't break the build.
const handler = keystaticEnabled ? makeRouteHandler({ config }) : null;

export const GET = handler ? handler.GET : off;
export const POST = handler ? handler.POST : off;
