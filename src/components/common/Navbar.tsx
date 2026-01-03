"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/entities";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getLinkClass = (href: string, baseClass: string) => {
    const isActive = pathname === href;
    if (isActive) {
      return `${baseClass} text-blue-600 font-bold border-b-2 border-blue-600 cursor-default px-1 pb-1`;
    }
    return `${baseClass} hover:text-blue-600 transition-colors duration-200 px-1 pb-1 border-b-2 border-transparent hover:border-blue-200`;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-800"
            >
              <img
                src="https://imgur.com/VWlUj2J.png"
                alt="Room Reservation Logo"
                className="h-8 w-8 object-contain"
              />
              <span>Room Reservation</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link href="/" className={getLinkClass("/", "text-gray-600")}>
              Rooms
            </Link>
            {user && user.role?.toLowerCase() !== UserRole.ADMIN && (
              <Link
                href="/my-reservations"
                className={getLinkClass("/my-reservations", "text-gray-600")}
              >
                My Reservations
              </Link>
            )}
            {user?.role?.toLowerCase() === UserRole.ADMIN && (
              <>
                <Link
                  href="/admin/reservations"
                  className={getLinkClass(
                    "/admin/reservations",
                    "text-gray-600"
                  )}
                >
                  Reservations List
                </Link>
                <Link
                  href="/admin/calendar"
                  className={getLinkClass("/admin/calendar", "text-gray-600")}
                >
                  Reservations Calendar
                </Link>
                <Link
                  href="/admin/users"
                  className={getLinkClass("/admin/users", "text-gray-600")}
                >
                  Users
                </Link>
              </>
            )}
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">
                    {user.fullName}
                  </span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className={getLinkClass("/", "block px-3 py-2 text-gray-600")}
              >
                Rooms
              </Link>
              {user && user.role?.toLowerCase() !== UserRole.ADMIN && (
                <Link
                  href="/my-reservations"
                  className={getLinkClass(
                    "/my-reservations",
                    "block px-3 py-2 text-gray-600"
                  )}
                >
                  My Reservations
                </Link>
              )}
              {user?.role?.toLowerCase() === UserRole.ADMIN && (
                <>
                  <Link
                    href="/admin/reservations"
                    className={getLinkClass(
                      "/admin/reservations",
                      "block px-3 py-2 text-gray-600"
                    )}
                  >
                    Reservations List
                  </Link>
                  <Link
                    href="/admin/calendar"
                    className={getLinkClass(
                      "/admin/calendar",
                      "block px-3 py-2 text-gray-600"
                    )}
                  >
                    Reservations Calendar
                  </Link>
                  <Link
                    href="/admin/users"
                    className={getLinkClass(
                      "/admin/users",
                      "block px-3 py-2 text-gray-600"
                    )}
                  >
                    Users
                  </Link>
                </>
              )}
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-center border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-center border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="px-3 py-4 border-t border-gray-100 mt-2">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="block w-full text-center bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
