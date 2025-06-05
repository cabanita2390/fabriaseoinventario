// src/entities/movimiento.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from './producto.entity';
import { Bodega } from './bodega.entity';

@Entity({ name: 'movimiento' })
export class Movimiento {
  @PrimaryGeneratedColumn({ name: 'idmovimiento' })
  id: number;

  @Column({ type: 'enum', enum: ['INGRESO', 'EGRESO'] })
  tipo: 'INGRESO' | 'EGRESO';

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'timestamp', name: 'fecha_movimiento' })
  fechaMovimiento: Date;

  @Column({ length: 200, nullable: true })
  descripcion: string;

  // Relación con Producto
  @ManyToOne(() => Producto, (producto) => producto.movimientos, {
    eager: true,
  })
  @JoinColumn({ name: 'producto_idproducto' })
  producto: Producto;

  // Relación con Bodega
  @ManyToOne(() => Bodega, (bodega) => bodega.movimientos, { eager: true })
  @JoinColumn({ name: 'bodega_idbodega' })
  bodega: Bodega;
}
