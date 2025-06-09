// src/entities/usuario.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rol } from './rol.entity';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'idusuario' })
  id: number;

  @Column({ unique: true })
  username: string; // <-- campo para login

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100, unique: true, nullable: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  // Cada usuario lleva asociado un Rol (ManyToOne)
  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true })
  @JoinColumn({ name: 'rol_idrol' })
  rol: Rol;
}
