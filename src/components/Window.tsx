import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type WindowProps = {
  title: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** When set, the red button becomes a real link (e.g. back to the desktop). */
  closeHref?: string;
  closeLabel?: string;
  /** Rendered at the right end of the title bar */
  actions?: ReactNode;
  /** Props spread onto the title bar (used by DraggableWindow) */
  barProps?: Record<string, unknown>;
  headingId?: string;
};

export function Window({ title, children, className = "", style, closeHref, closeLabel, actions, barProps, headingId }: WindowProps) {
  return (
    <section className={`win ${className}`} style={style} aria-labelledby={headingId}>
      <div className="win-bar" {...barProps}>
        <div className="traffic">
          {closeHref ? (
            <Link href={closeHref} className="t-close" aria-label={closeLabel ?? "Close window"} />
          ) : (
            <span className="t-close" aria-hidden="true" />
          )}
          <span className="t-min" aria-hidden="true" />
          <span className="t-max" aria-hidden="true" />
        </div>
        <h2 className="win-title" id={headingId}>
          {title}
        </h2>
        {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="win-body">{children}</div>
    </section>
  );
}

export function ClassicWindow({
  title,
  children,
  className = "",
  style,
  barProps,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  barProps?: Record<string, unknown>;
}) {
  return (
    <section className={`win-classic ${className}`} style={style} aria-label={title}>
      <div className="classic-bar" {...barProps}>
        <span className="classic-box" aria-hidden="true" />
        <span className="classic-title">{title}</span>
        <span className="w-[11px]" aria-hidden="true" />
      </div>
      <div>{children}</div>
    </section>
  );
}
