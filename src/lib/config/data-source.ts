import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Room } from "../entities/Room";
import { RoomType } from "../entities/RoomType";
import { Reservation } from "../entities/Reservation";
import { ReservationStatus } from "../entities/ReservationStatus";
import { EmailQueue } from "../entities/EmailQueue";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "room-reservation-db",
  synchronize: false,
  logging: true,
  entities: [User, Room, RoomType, Reservation, ReservationStatus, EmailQueue],
  migrations: ["src/lib/migrations/*.ts"],
  subscribers: [],
});
