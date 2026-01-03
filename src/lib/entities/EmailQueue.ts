import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Reservation } from "./Reservation";

@Entity("email_queues")
export class EmailQueue {
  static readonly entityName = "EmailQueue";
  @PrimaryGeneratedColumn({ name: "email_queue_id" })
  emailQueueId!: number;

  @Column({ length: 255 })
  toEmail!: string;

  @Column({ length: 255 })
  subject!: string;

  @Column({ type: "text" })
  body!: string;

  @Column({ length: 50 })
  emailType!: string;

  @Column({ length: 20, default: "pending" })
  status!: string;

  @Column({ default: 0 })
  attempts!: number;

  @Column({ default: 3 })
  maxAttempts!: number;

  @Column({ type: "timestamp" })
  scheduledSendTime!: Date;

  @Column({ type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ length: 1000, default: "" })
  errorMessage!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "reservation_id", nullable: true })
  reservationId?: number;

  @ManyToOne("Reservation")
  @JoinColumn({ name: "reservation_id" })
  reservation?: Reservation;

  @Column({ type: "text", nullable: true })
  metadata?: string;
}
