import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Video } from "./Video";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 120, unique: true })
  email: string;

  @Column({ type: "varchar", length: 120 })
  name: string;

  @Column({ type: "varchar", length: 200 })
  password: string; // hash bcrypt

  @OneToMany(() => Video, (v) => v.user)
  videos: Video[];

  @CreateDateColumn()
  createdAt: Date;
}
