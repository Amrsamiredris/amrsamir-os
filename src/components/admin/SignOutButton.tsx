"use client";

import { post } from "./post";

export function SignOutButton() {
  return (
    <button
      type="button"
      className="admin-navbtn"
      onClick={async () => {
        await post("/api/admin/logout");
        window.location.href = "/admin/login";
      }}
    >
      Sign out
    </button>
  );
}
