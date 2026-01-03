"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RoomCard } from "@/components/rooms";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/entities";

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
  };
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [, setTotalRooms] = useState(0);
  const { user } = useAuth();
  const itemsPerPage = 6;

  const fetchRooms = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/rooms?page=${page}&limit=${itemsPerPage}`
      );
      const data = await response.json();

      if (data.success) {
        setRooms(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalRooms(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(currentPage);
  }, [currentPage]);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find Your Perfect Room
          </h1>
          <p className="text-xl mb-8">
            Discover comfortable and affordable rooms for your stay
          </p>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Available Rooms</h2>
          {user?.role?.toLowerCase() === UserRole.ADMIN && (
            <Link
              href="/admin/rooms/new"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center shadow-md font-medium"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Room
            </Link>
          )}
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No rooms available at the moment.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {rooms.map((room) => (
                <RoomCard
                  key={room.roomId}
                  id={room.roomId.toString()}
                  name={room.roomNumber}
                  description={
                    room.roomType.description || "No description available"
                  }
                  price={room.roomType.pricePerNight}
                  capacity={room.roomType.capacity}
                  imageRoom={room.imageRoom}
                  roomType={{ name: room.roomType.roomTypeName }}
                  buttonText={
                    user?.role?.toLowerCase() === UserRole.ADMIN
                      ? "Details"
                      : "Book Now"
                  }
                  buttonLink={
                    user?.role?.toLowerCase() === UserRole.ADMIN
                      ? `/admin/rooms/${room.roomId}`
                      : `/rooms/${room.roomId}`
                  }
                  isDisabled={!user}
                  tooltipMessage={
                    !user
                      ? "Please register or login to book a room"
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === number
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
