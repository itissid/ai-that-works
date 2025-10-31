"use client";

import { useRouter } from "next/navigation";
import { clearUser } from "@/lib/auth";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    clearUser();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition font-medium ${className}`}
    >
      Logout
    </button>
  );
}
