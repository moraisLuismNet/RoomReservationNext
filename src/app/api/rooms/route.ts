import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { Room } from "@/lib/entities/Room";
import { unstable_cache } from "next/cache";

// Cache room data for 5 minutes to reduce database queries
const getCachedRooms = unstable_cache(
  async (page: number, limit: number) => {
    console.time("database-query");
    const dataSource = await getDatabase();
    const roomRepository = dataSource.getRepository(Room);

    // Use optimized query with proper relations and pagination
    const [rooms, total] = await roomRepository.findAndCount({
      relations: ["roomType"], // Fixed: was "room", should be "roomType"
      where: { isActive: true },
      order: { roomId: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    console.timeEnd("database-query");

    console.log(
      `Found ${total} total rooms, returning ${rooms.length} rooms for page ${page}`
    );

    // Transform the data to match frontend expectations
    console.time("data-transform");
    const transformedRooms = rooms.map((room) => ({
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      isActive: room.isActive,
      imageRoom: room.imageRoom,
      roomType: room.roomType, // Fixed: was room.room, should be room.roomType
    }));
    console.timeEnd("data-transform");

    return { rooms: transformedRooms, total };
  },
  ["rooms-data"], // Cache key
  {
    revalidate: 300, // Cache for 5 minutes (300 seconds)
    tags: ["rooms"], // Allow cache invalidation
  }
);

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6"); // Default 6 rooms per page

    console.log(`API: Fetching rooms - page: ${page}, limit: ${limit}`);

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pagination parameters",
        },
        { status: 400 }
      );
    }

    // Get cached rooms data
    const { rooms, total } = await getCachedRooms(page, limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Get rooms error details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message || String(error),
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
