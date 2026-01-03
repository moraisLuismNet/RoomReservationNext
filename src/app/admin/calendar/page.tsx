"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/lib/entities/UserRole";

interface Reservation {
  reservationId: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  room: {
    roomNumber: string;
    roomType: {
      roomTypeName: string;
    };
  };
  status: {
    name: string;
  };
}

function AdminCalendarContent() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setReservations(data.data);
      }
    } catch (error) {
      console.error("Error fetching admin reservations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days of previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-32 border border-gray-100 bg-gray-50"
        ></div>
      );
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const dayReservations = reservations.filter((res) => {
        const start = res.checkInDate.split("T")[0];
        const end = res.checkOutDate.split("T")[0];
        return dateStr >= start && dateStr <= end;
      });

      days.push(
        <div
          key={day}
          className="h-32 border border-gray-100 p-2 overflow-y-auto hover:bg-blue-50 transition-colors"
        >
          <div className="font-semibold text-sm mb-1">{day}</div>
          <div className="space-y-1">
            {dayReservations.map((res) => (
              <div
                key={res.reservationId}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReservation(res);
                }}
                className={`text-[10px] p-1 rounded truncate border cursor-pointer hover:brightness-95 transition-all ${
                  res.status.name.toLowerCase() === "confirmed"
                    ? "bg-green-100 border-green-200 text-green-800"
                    : res.status.name.toLowerCase() === "pending"
                    ? "bg-yellow-100 border-yellow-200 text-yellow-800"
                    : "bg-red-100 border-red-200 text-red-800"
                }`}
                title={`${res.email} - Room ${res.room.roomNumber}`}
              >
                Room {res.room.roomNumber}: {res.email.split("@")[0]}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reservations Calendar
          </h1>
          <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                  )
                )
              }
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-xl font-semibold min-w-[150px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                  )
                )
              }
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">{renderCalendar()}</div>
        </div>

        <div className="mt-8 flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>

        {/* Modal */}
        {selectedReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                <h3 className="text-xl font-bold">
                  Reservation #{selectedReservation.reservationId}
                </h3>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="hover:bg-blue-700 p-1 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex justify-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border ${
                      selectedReservation.status.name.toLowerCase() ===
                      "confirmed"
                        ? "bg-green-100 border-green-200 text-green-800"
                        : selectedReservation.status.name.toLowerCase() ===
                          "pending"
                        ? "bg-yellow-100 border-yellow-200 text-yellow-800"
                        : "bg-red-100 border-red-200 text-red-800"
                    }`}
                  >
                    {selectedReservation.status.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Customer
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedReservation.fullName || "No Name"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Email
                    </label>
                    <p
                      className="text-gray-900 font-medium truncate"
                      title={selectedReservation.email}
                    >
                      {selectedReservation.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Phone
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedReservation.phoneNumber || "No Phone"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Room
                    </label>
                    <p className="text-gray-900 font-medium">
                      #{selectedReservation.room.roomNumber} (
                      {selectedReservation.room.roomType.roomTypeName})
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Check-In
                    </label>
                    <p className="text-gray-900 font-medium">
                      {new Date(
                        selectedReservation.checkInDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Check-Out
                    </label>
                    <p className="text-gray-900 font-medium">
                      {new Date(
                        selectedReservation.checkOutDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Guests
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedReservation.numberOfGuests}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Total Price
                    </label>
                    <p className="text-xl font-bold text-blue-600">
                      {selectedReservation.totalPrice}€
                    </p>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
            {/* Backdrop Click */}
            <div
              className="absolute inset-0 -z-10"
              onClick={() => setSelectedReservation(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCalendarPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminCalendarContent />
    </ProtectedRoute>
  );
}
