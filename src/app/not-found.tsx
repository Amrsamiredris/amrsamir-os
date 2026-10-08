import Link from "next/link";
import { ClassicWindow } from "@/components/Window";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <ClassicWindow title="Alert" className="w-full max-w-[380px]">
        <div className="flex gap-4 px-4 py-5">
          <span className="pixel text-[34px] leading-none" aria-hidden="true">
            ?
          </span>
          <div>
            <h1 className="text-[15px] font-semibold">This page doesn’t exist.</h1>
            <p className="mt-1 text-[13px]">The link may be old or mistyped.</p>
            <Link href="/" className="mt-4 inline-block border border-current px-4 py-1 text-[13px] shadow-[2px_2px_0_currentColor]">
              Back to the desktop
            </Link>
          </div>
        </div>
      </ClassicWindow>
    </div>
  );
}
