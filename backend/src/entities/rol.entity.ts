// src/entities/rol.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity({ name: 'rol' })
export class Rol {
  @PrimaryGeneratedColumn({ name: 'idrol' })
  id: number;

  @Column({ length: 50, unique: true })
  nombre: string;

  //   // Relación inversa: un rol puede tener muchos usuarios
  //   @OneToMany(() => Usuario, (usuario) => usuario.rol)
  //   usuarios: Usuario[];
}
