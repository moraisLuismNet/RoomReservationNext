"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/lib/entities";

interface RoomType {
  roomTypeId: number;
  roomTypeName: string;
  pricePerNight: number;
}

function CreateRoomContent() {
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTypes, setIsFetchingTypes] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomTypeId: "",
    isActive: true,
    imageRoom: "",
  });

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("/api/room-types");
      const data = await response.json();
      if (data.success) {
        setRoomTypes(data.data);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
    } finally {
      setIsFetchingTypes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          roomTypeId: parseInt(formData.roomTypeId),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Room created successfully!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(data.message || "Failed to create room");
      }
    } catch (error) {
      console.error("Create room error:", error);
      setError("An error occurred while creating the room");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingTypes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden p-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Room</h1>
        </div>

        <div className="mb-6 rounded-lg overflow-hidden h-48 bg-gray-100 relative">
          <img
            src={formData.imageRoom || "https://imgur.com/Zemqvh3.png"}
            alt="Room Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://imgur.com/Zemqvh3.png";
            }}
          />
          {!formData.imageRoom && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              No image URL provided
            </div>
          )}
        </div>

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
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
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="roomNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Room Number
            </label>
            <input
              type="text"
              id="roomNumber"
              value={formData.roomNumber}
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 101"
              required
            />
          </div>

          <div>
            <label
              htmlFor="roomTypeId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Room Type
            </label>
            <select
              id="roomTypeId"
              value={formData.roomTypeId}
              onChange={(e) =>
                setFormData({ ...formData, roomTypeId: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>
                Select a room type
              </option>
              {roomTypes.map((type) => (
                <option key={type.roomTypeId} value={type.roomTypeId}>
                  {type.roomTypeName} ({type.pricePerNight}€/night)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="imageRoom"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image URL (Optional)
            </label>
            <input
              type="url"
              id="imageRoom"
              value={formData.imageRoom}
              onChange={(e) =>
                setFormData({ ...formData, imageRoom: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://imgur.com/..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label
              htmlFor="isActive"
              className="ml-2 block text-sm text-gray-900 cursor-pointer"
            >
              Room is active and available for booking
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Create Room"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CreateRoomPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <CreateRoomContent />
    </ProtectedRoute>
  );
}
