"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <LoginForm onSuccess={() => {}} />
        </div>

        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account? You'll be automatically registered when you
          sign in.
        </p>
      </div>
    </div>
  );
}
