"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Reservation {
  reservationId: number;
  email: string;
  roomId: number;
  statusId: number;
  reservationDate: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  room: {
    roomId: number;
    roomNumber: string;
    roomType: {
      roomTypeName: string;
      pricePerNight: number;
    };
  };
  status: {
    name: string;
  };
}

function MyReservationsContent() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingReservationId, setCancellingReservationId] = useState<
    number | null
  >(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReservations(data.data);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCancel = (reservationId: number) => {
    setCancellingReservationId(reservationId);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = async () => {
    if (!cancellingReservationId) return;

    setIsCancelling(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `/api/reservations/${cancellingReservationId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Reservation cancelled successfully");
        setCancellingReservationId(null);
        fetchReservations(); // Refresh list
      } else {
        setError(data.message || "Failed to cancel reservation");
        setCancellingReservationId(null);
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      setError("An error occurred. Please try again.");
      setCancellingReservationId(null);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Reservations
          </h1>
          <p className="text-xl text-gray-600">
            View and manage your room reservations
          </p>
        </div>

        {success && (
          <div className="max-w-3xl mx-auto mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              You don't have any reservations yet.
            </p>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Browse Rooms
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in / Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booked On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr
                    key={reservation.reservationId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {reservation.room.roomType.roomTypeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Room {reservation.room.roomNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(reservation.checkInDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {new Date(
                          reservation.checkOutDate
                        ).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.numberOfGuests}{" "}
                      {reservation.numberOfGuests === 1 ? "Guest" : "Guests"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          reservation.status.name
                        )}`}
                      >
                        {reservation.status.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {Math.ceil(
                        (new Date(reservation.checkOutDate).getTime() -
                          new Date(reservation.checkInDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) * reservation.room.roomType.pricePerNight}
                      €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                      {new Date(
                        reservation.reservationDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(() => {
                        const checkIn = new Date(reservation.checkInDate);
                        const now = new Date();
                        const diffHours =
                          (checkIn.getTime() - now.getTime()) /
                          (1000 * 60 * 60);

                        if (
                          diffHours > 24 &&
                          reservation.status.name.toLowerCase() !== "cancelled"
                        ) {
                          return (
                            <button
                              onClick={() =>
                                confirmCancel(reservation.reservationId)
                              }
                              className="text-red-600 hover:text-red-900 font-bold"
                            >
                              Cancel
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Cancellation Modal */}
      {cancellingReservationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Are you sure?
              </h3>
              <p className="text-center text-gray-600 mb-8">
                You are about to cancel this reservation. This action cannot be
                undone.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => setCancellingReservationId(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  disabled={isCancelling}
                >
                  Close
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    "Cancel Reservation"
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Backdrop click */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => !isCancelling && setCancellingReservationId(null)}
          />
        </div>
      )}
    </div>
  );
}

export default function MyReservationsPage() {
  return (
    <ProtectedRoute>
      <MyReservationsContent />
    </ProtectedRoute>
  );
}
