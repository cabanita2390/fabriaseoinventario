// src/entities/inventario.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from './producto.entity';
import { Bodega } from './bodega.entity';

@Entity({ name: 'inventario' })
export class Inventario {
  @PrimaryGeneratedColumn({ name: 'idinventario' })
  id: number;

  @Column({ type: 'int' })
  cantidad_actual: number;

  @Column({ type: 'timestamp', name: 'fecha_ultima_actualizacion' })
  fechaUltimaActualizacion: Date;

  // Relación con Producto: cada inventario pertenece a un producto
  @ManyToOne(() => Producto, (producto) => producto.inventarios, {
    eager: true,
  })
  @JoinColumn({ name: 'producto_idproducto' })
  producto: Producto;

  // Relación con Bodega: cada inventario pertenece a una bodega
  @ManyToOne(() => Bodega, (bodega) => bodega.inventarios, { eager: true })
  @JoinColumn({ name: 'bodega_idbodega' })
  bodega: Bodega;
}
