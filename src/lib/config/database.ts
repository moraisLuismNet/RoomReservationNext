import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import * as path from "path";

// Import entities from the original Node.js backend
import { User } from "../entities/User";
import { Room } from "../entities/Room";
import { RoomType } from "../entities/RoomType";
import { Reservation } from "../entities/Reservation";
import { ReservationStatus } from "../entities/ReservationStatus";
import { EmailQueue } from "../entities/EmailQueue";

// Database configuration - PostgreSQL only
const getDatabaseConfig = (): DataSourceOptions => {
  console.log(`Database configuration: PostgreSQL`);

  return {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "room-reservation-db",
    ssl: false, // Disable SSL as server doesn't support it
    synchronize: true, // Enable synchronize to create tables automatically
    logging: false as any,
    entities: [
      User,
      Room,
      RoomType,
      Reservation,
      ReservationStatus,
      EmailQueue,
    ].map((entity) => {
      // Patch entity name for production minification
      if ((entity as any).entityName) {
        Object.defineProperty(entity, "name", {
          value: (entity as any).entityName,
          configurable: true,
        });
      }
      return entity;
    }),
    migrations: [path.join(process.cwd(), "src/lib/migrations/*.{ts,js}")],
    subscribers: [],
    // Simplified connection settings to avoid hanging
    connectTimeoutMS: 10000, // 10 second connection timeout
    // Remove complex pooling settings that might cause issues
  };
};

export const AppDataSource = new DataSource(getDatabaseConfig());

let initializationPromise: Promise<DataSource> | null = null;

// Initialize database connection
export async function initializeDatabase() {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("Starting database connection...");
      await AppDataSource.initialize();
      console.log("Database connection established successfully");
      return AppDataSource;
    } catch (error) {
      console.error("Database connection failed:", error);
      initializationPromise = null; // Allow retry
      throw error;
    }
  })();

  return initializationPromise;
}

// Get database connection for API routes
export async function getDatabase() {
  try {
    const dataSource = await initializeDatabase();
    return dataSource;
  } catch (error) {
    console.error("Failed to get database connection:", error);
    throw error;
  }
}
