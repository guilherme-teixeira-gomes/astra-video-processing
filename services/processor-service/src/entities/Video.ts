import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("videos")
export class Video {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "varchar", length: 255 })
  originalName: string;

  @Column({ type: "varchar", length: 500 })
  storagePath: string;

  @Column({ type: "varchar", length: 30, default: "RECEBIDO" })
  status: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  zipPath: string;

  @Column({ type: "int", nullable: true })
  frameCount: number;

  @Column({ type: "text", nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
