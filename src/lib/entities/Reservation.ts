import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { User } from "./User";
import type { Room } from "./Room";
import type { ReservationStatus } from "./ReservationStatus";

@Entity({ name: "reservations" })
export class Reservation {
  static readonly entityName = "Reservation";
  @PrimaryGeneratedColumn({ name: "reservation_id" })
  reservationId!: number;

  @Column({ name: "email" })
  email!: string;

  @Column({ name: "room_id" })
  roomId!: number;

  @Column({ name: "status_id" })
  statusId!: number;

  @Column({ name: "reservation_date", type: "timestamp" })
  reservationDate!: Date;

  @Column({ name: "check_in_date", type: "date" })
  checkInDate!: string; // YYYY-MM-DD

  @Column({ name: "check_out_date", type: "date" })
  checkOutDate!: string; // YYYY-MM-DD

  @Column({ name: "number_of_guests", default: 1 })
  numberOfGuests!: number;

  @Column({ name: "cancellation_date", type: "timestamp", nullable: true })
  cancellationDate?: Date;

  @Column({ name: "cancellation_reason", type: "text", nullable: true })
  cancellationReason?: string;

  @ManyToOne("User")
  @JoinColumn({ name: "email" })
  user!: User;

  @ManyToOne("Room", "reservations")
  @JoinColumn({ name: "room_id" })
  room!: Room;

  @ManyToOne("ReservationStatus", "reservations")
  @JoinColumn({ name: "status_id" })
  status!: ReservationStatus;

  /**
   * Check if a room is available for the given dates
   */
  static async isRoomAvailable(
    roomId: number,
    checkInDate: string,
    checkOutDate: string,
    excludeReservationId?: number
  ): Promise<boolean> {
    // This method will be implemented in the service layer
    // as it requires database connection
    return true;
  }
}
