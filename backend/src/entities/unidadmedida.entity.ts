import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Producto } from './producto.entity';

@Entity({ name: 'unidadmedida' })
export class UnidadMedida {
  @PrimaryGeneratedColumn({ name: 'idunidadmedida' })
  id: number;

  @Column({ length: 45 })
  nombre: string;

  @OneToMany(() => Producto, (producto) => producto.unidadMedida)
  productos: Producto[];
}
