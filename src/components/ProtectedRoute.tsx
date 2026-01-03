"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo);
      } else if (requiredRole && user.role !== requiredRole) {
        router.push("/"); // Redirect to home if unauthorized
      }
    }
  }, [user, isLoading, router, redirectTo, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
