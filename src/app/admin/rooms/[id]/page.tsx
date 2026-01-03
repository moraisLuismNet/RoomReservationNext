"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/lib/entities";

interface RoomType {
  roomTypeId: number;
  roomTypeName: string;
  description?: string;
  pricePerNight: number;
  capacity: number;
  amenities?: string;
}

interface Room {
  roomId: number;
  roomNumber: string;
  isActive: boolean;
  imageRoom?: string;
  roomType: RoomType;
}

function AdminRoomDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: "",
    isActive: true,
    imageRoom: "",
    roomTypeId: 0,
  });

  useEffect(() => {
    fetchRoomTypes();
    if (params.id) {
      fetchRoomDetails();
    }
  }, [params.id]);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("/api/room-types");
      const data = await response.json();
      if (data.success) {
        setRoomTypes(data.data);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
    }
  };

  const fetchRoomDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/rooms/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        const roomData = data.data;
        const imageUrl = roomData.imageRoom || roomData.image_room || "";

        setRoom(roomData);
        setFormData({
          roomNumber: roomData.roomNumber,
          isActive: roomData.isActive,
          imageRoom: imageUrl,
          roomTypeId: roomData.roomType.roomTypeId,
        });
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/rooms/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Room updated successfully!");
        setSuccess("Room updated successfully!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(data.message || "Failed to update room");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError("An error occurred while updating the room");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/rooms/${params.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Room deleted successfully!");
        setShowDeleteModal(false);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(data.message || "Failed to delete room");
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("An error occurred while deleting the room");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
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
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-800 flex items-center"
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
            Back to Rooms
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={
              isEditing
                ? formData.imageRoom || "https://imgur.com/Zemqvh3.png"
                : room.imageRoom ||
                  (room as any).image_room ||
                  "https://imgur.com/Zemqvh3.png"
            }
            alt={room.roomType.roomTypeName}
            className="w-full h-64 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://imgur.com/Zemqvh3.png";
            }}
          />

          <div className="p-6">
            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
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
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
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

            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {room.roomType.roomTypeName}
                </h1>
                <p className="text-gray-600">
                  {room.roomType.description ||
                    "Comfortable and well-appointed room"}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  room.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {room.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {!isEditing ? (
              <>
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
                    <span className="text-sm text-gray-500">
                      Price per night
                    </span>
                    <p className="text-lg font-semibold">
                      {room.roomType.pricePerNight}€
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Room Type</span>
                    <p className="text-lg font-semibold">
                      {room.roomType.roomTypeName}
                    </p>
                  </div>
                </div>

                {room.roomType.amenities && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                    <p className="text-gray-600">{room.roomType.amenities}</p>
                  </div>
                )}

                <div className="flex space-x-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Edit Room
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex-1 bg-white text-red-600 border-2 border-red-600 py-2.5 px-4 rounded-lg font-semibold hover:bg-red-50 transition-colors shadow-sm"
                  >
                    Delete Room
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="roomNumber"
                    className="block text-sm font-medium text-gray-700"
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="imageRoom"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="imageRoom"
                    value={formData.imageRoom}
                    onChange={(e) =>
                      setFormData({ ...formData, imageRoom: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="roomTypeId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Room Type
                  </label>
                  <select
                    id="roomTypeId"
                    value={formData.roomTypeId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roomTypeId: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Select a room type
                    </option>
                    {roomTypes.map((type) => (
                      <option key={type.roomTypeId} value={type.roomTypeId}>
                        {type.roomTypeName} (${type.pricePerNight}/night)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Room is active
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/");
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        {/* Custom Delete Modal */}
        {showDeleteModal && (
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
                  You're sure?
                </h3>
                <p className="text-center text-gray-600 mb-8">
                  This action cannot be undone. The room {room.roomNumber} will
                  be permanently deleted from the database.
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
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
                      "Yes, Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* Backdrop click */}
            <div
              className="absolute inset-0 -z-10"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminRoomDetailsPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminRoomDetailsContent />
    </ProtectedRoute>
  );
}
