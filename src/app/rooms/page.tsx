"use client";

import { useState, useEffect } from "react";
import { RoomCard } from "@/components/rooms";

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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Rooms</h1>
            <p className="text-gray-600">
              Explore our selection of premium rooms
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              {totalRooms} Rooms Available
            </span>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-xl font-medium">
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
                  buttonText="Book Now"
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                            currentPage === number
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
