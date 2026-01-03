import Link from "next/link";
import Image from "next/image";

interface RoomCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  imageRoom?: string;
  roomType?: {
    name: string;
  };
  buttonText?: string;
  buttonLink?: string;
  isDisabled?: boolean;
  tooltipMessage?: string;
}

export default function RoomCard({
  id,
  name,
  description,
  price,
  capacity,
  imageRoom,
  roomType,
  buttonText = "View Details",
  buttonLink,
  isDisabled = false,
  tooltipMessage,
}: RoomCardProps) {
  const defaultImage = "https://imgur.com/Zemqvh3.png";
  const finalButtonLink = buttonLink || `/rooms/${id}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={imageRoom || defaultImage}
          alt={name}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          {roomType && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {roomType.name}
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-blue-600">
            {price}€<span className="text-sm text-gray-500">/night</span>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium">{capacity}</span> guests
          </div>
        </div>

        {isDisabled ? (
          <div className="relative group">
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 text-center py-2 px-4 rounded-md cursor-not-allowed transition-colors"
            >
              {buttonText}
            </button>
            {tooltipMessage && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-full max-w-xs bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-xl z-10 text-center">
                {tooltipMessage}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href={finalButtonLink}
            className={`block w-full text-center py-2 px-4 rounded-md transition-all duration-200 font-medium ${
              buttonText === "Details"
                ? "bg-slate-700 text-white hover:bg-slate-800 shadow-sm"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
            }`}
          >
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}
