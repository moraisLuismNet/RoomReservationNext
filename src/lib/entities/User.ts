import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import * as bcrypt from "bcryptjs";

import { UserRole } from "./UserRole";

@Entity("users")
export class User {
  static readonly entityName = "User";
  @PrimaryColumn({ length: 100 })
  email!: string;

  @Column({ name: "full_name", length: 100 })
  fullName!: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @Column({ name: "phone_number", length: 20, nullable: true })
  phoneNumber?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column({ name: "last_login", type: "timestamp", nullable: true })
  lastLogin?: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  async hashPassword() {
    if (this.passwordHash && !this.passwordHash.startsWith("$2a$")) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.passwordHash);
  }

  static async isEmailTaken(
    email: string,
    excludeEmail?: string
  ): Promise<boolean> {
    const { getDatabase } = await import("../config/database");
    const dataSource = await getDatabase();
    const user = await dataSource
      .getRepository(User)
      .findOne({ where: { email } });
    return !!user && user.email !== excludeEmail;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { getDatabase } = await import("../config/database");
    const dataSource = await getDatabase();
    return dataSource.getRepository(User).findOne({ where: { email } });
  }
}
