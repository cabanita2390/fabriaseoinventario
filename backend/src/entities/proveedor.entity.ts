// src/entities/proveedor.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Producto } from './producto.entity';

@Entity({ name: 'proveedor' })
export class Proveedor {
  @PrimaryGeneratedColumn({ name: 'idproveedor' })
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 15 })
  telefono: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 200 })
  direccion: string;

  // Relación con Producto: un proveedor puede tener muchos productos
  @OneToMany(() => Producto, (producto) => producto.proveedor)
  productos: Producto[];
}
