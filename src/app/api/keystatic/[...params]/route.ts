import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

const handler = makeRouteHandler({ config });
const enabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";
const off = () => new Response("Not found", { status: 404 });

export const GET = enabled ? handler.GET : off;
export const POST = enabled ? handler.POST : off;
