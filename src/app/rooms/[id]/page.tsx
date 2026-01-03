"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Reservation {
  reservationId: number;
  checkInDate: string;
  checkOutDate: string;
  status: {
    name: string;
  };
}

interface Room {
  roomId: number;
  roomNumber: string;
  isActive: boolean;
  imageRoom?: string;
  roomType: {
    roomTypeId: number;
    roomTypeName: string;
    description?: string;
    pricePerNight: number;
    capacity: number;
    amenities?: string;
  };
  reservations?: Reservation[];
}

export default function RoomDetailsPage() {
  const params = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (params.id) {
      fetchRoomDetails();
    }
  }, [params.id]);

  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setRoom(data.data);
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to make a reservation");
        return;
      }

      // Calculate total price
      const nights = Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: room?.roomId,
          roomNumber: room?.roomNumber,
          roomTypeName: room?.roomType.roomTypeName,
          checkInDate,
          checkOutDate,
          numberOfGuests,
          pricePerNight: room?.roomType.pricePerNight,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        alert(data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred while processing payment");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Room not found
          </h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to rooms
          </Link>
        </div>
      </div>
    );
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isReserved = (dateStr: string) => {
    if (!room.reservations) return false;
    return room.reservations.some((res) => {
      const start = res.checkInDate.split("T")[0];
      const end = res.checkOutDate.split("T")[0];
      return dateStr >= start && dateStr < end;
    });
  };

  const isRangeBlocked = (start: string, end: string) => {
    if (!room.reservations) return false;
    return room.reservations.some((res) => {
      const resStart = res.checkInDate.split("T")[0];
      const resEnd = res.checkOutDate.split("T")[0];
      // Overlap: (start < resEnd) && (resStart < end)
      return start < resEnd && resStart < end;
    });
  };

  const isButtonEnabled = () => {
    if (!checkInDate || !checkOutDate) return false;
    if (checkInDate >= checkOutDate) return false;
    if (isRangeBlocked(checkInDate, checkOutDate)) return false;
    return true;
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

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

    // Header
    const calendarHeader = (
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-1 hover:bg-gray-100 rounded"
          type="button"
        >
          <svg
            className="w-5 h-5"
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
        <span className="font-semibold text-gray-700">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-1 hover:bg-gray-100 rounded"
          type="button"
        >
          <svg
            className="w-5 h-5"
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
    );

    // Grid days labels
    const dayLabels = (
      <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-bold text-gray-400 uppercase">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
    );

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const reserved = isReserved(dateStr);
      const isCheckIn = checkInDate === dateStr;
      const isCheckOut = checkOutDate === dateStr;
      const isToday = new Date().toISOString().split("T")[0] === dateStr;

      days.push(
        <div
          key={day}
          className={`h-8 flex items-center justify-center text-xs rounded-full border cursor-pointer transition-colors relative
            ${
              reserved
                ? "bg-red-50 border-red-200 text-red-800 font-bold"
                : isCheckIn || isCheckOut
                ? "bg-blue-600 border-blue-600 text-white font-bold"
                : "hover:bg-blue-50 border-transparent text-gray-700"
            }
            ${isToday ? "ring-2 ring-blue-400 ring-offset-1" : ""}
          `}
          title={reserved ? "Reserved" : ""}
          onClick={() => {
            if (!reserved) {
              if (!checkInDate || (checkInDate && checkOutDate)) {
                setCheckInDate(dateStr);
                setCheckOutDate("");
              } else {
                if (dateStr > checkInDate) {
                  setCheckOutDate(dateStr);
                } else {
                  setCheckInDate(dateStr);
                  setCheckOutDate("");
                }
              }
            }
          }}
        >
          {day}
          {reserved && (
            <div className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full"></div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        {calendarHeader}
        {dayLabels}
        <div className="grid grid-cols-7 gap-1">{days}</div>
        <div className="mt-4 flex space-x-4 text-[10px]">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-100 border border-red-200 rounded-full mr-1"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 border border-blue-400 rounded-full mr-1 ring-1 ring-blue-400"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={room.imageRoom || "https://imgur.com/Zemqvh3.png"}
              alt={room.roomType.roomTypeName}
              className="w-full h-96 object-cover rounded-lg mb-6"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://imgur.com/Zemqvh3.png";
              }}
            />

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {room.roomType.roomTypeName}
              </h1>
              <p className="text-gray-600 mb-6">
                {room.roomType.description ||
                  "Comfortable and well-appointed room"}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">Room Number</span>
                  <p className="text-lg font-semibold">{room.roomNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Capacity</span>
                  <p className="text-lg font-semibold">
                    {room.roomType.capacity} guests
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Price per night</span>
                  <p className="text-lg font-semibold">
                    {room.roomType.pricePerNight}€
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status</span>
                  <p className="text-lg font-semibold text-green-600">
                    {room.isActive ? "Available" : "Not Available"}
                  </p>
                </div>
              </div>

              {room.roomType.amenities && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                  <p className="text-gray-600">{room.roomType.amenities}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Availability Calendar
                </h3>
                {renderCalendar()}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Make a Reservation
            </h2>

            <form onSubmit={handleReservation} className="space-y-6">
              <div>
                <label
                  htmlFor="checkInDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Check-in Date
                </label>
                <input
                  type="date"
                  id="checkInDate"
                  name="checkInDate"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label
                  htmlFor="checkOutDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Check-out Date
                </label>
                <input
                  type="date"
                  id="checkOutDate"
                  name="checkOutDate"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label
                  htmlFor="numberOfGuests"
                  className="block text-sm font-medium text-gray-700"
                >
                  Number of Guests
                </label>
                <select
                  id="numberOfGuests"
                  name="numberOfGuests"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                >
                  {Array.from(
                    { length: room.roomType.capacity },
                    (_, i) => i + 1
                  ).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              {checkInDate && checkOutDate && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Reservation Summary</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(checkOutDate).getDate() -
                      new Date(checkInDate).getDate()}{" "}
                    nights × {room.roomType.pricePerNight}€
                  </p>
                  <p className="text-lg font-bold">
                    Total:{" "}
                    {(new Date(checkOutDate).getDate() -
                      new Date(checkInDate).getDate()) *
                      room.roomType.pricePerNight}
                    €
                  </p>
                </div>
              )}

              {checkInDate &&
                checkOutDate &&
                isRangeBlocked(checkInDate, checkOutDate) && (
                  <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <p className="text-sm text-red-600 font-semibold">
                      The selected range overlaps with an existing reservation.
                    </p>
                  </div>
                )}

              <button
                type="submit"
                disabled={!isButtonEnabled()}
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                  ${
                    isButtonEnabled()
                      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Proceed To Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
