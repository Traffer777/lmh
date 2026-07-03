"use client";

import { useRouter } from "next/navigation";

export default function AccountLogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} className="btn btn-sm">
      Выйти
    </button>
  );
}
