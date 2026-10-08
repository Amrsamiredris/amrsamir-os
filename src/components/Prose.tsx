import Markdoc, { type Node } from "@markdoc/markdoc";
import React from "react";

export function Prose({ node }: { node: Node }) {
  const content = Markdoc.transform(node);
  return <div className="prose">{Markdoc.renderers.react(content, React)}</div>;
}
