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

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  // Relación con Rol: cada usuario tiene un rol
//   @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true })
//   @JoinColumn({ name: 'rol_idrol' })
//   rol: Rol;
}
