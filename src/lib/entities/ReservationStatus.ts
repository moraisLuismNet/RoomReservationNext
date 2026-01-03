import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { Reservation } from "./Reservation";

import { ReservationStatusName } from "./ReservationStatusName";

@Entity({ name: "reservation_statuses" })
export class ReservationStatus {
  static readonly entityName = "ReservationStatus";
  @PrimaryGeneratedColumn({ name: "status_id" })
  statusId!: number;

  @Column({
    type: "enum",
    enum: ReservationStatusName,
    unique: true,
  })
  name!: ReservationStatusName;

  @OneToMany("Reservation", "status")
  reservations!: Reservation[];
}
