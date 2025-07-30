import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Inventario } from './inventario.entity';
import { Movimiento } from './movimiento.entity';

@Entity({ name: 'bodega' })
export class Bodega {
  @PrimaryGeneratedColumn({ name: 'idbodega' })
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 200, nullable: true })
  ubicacion: string;

  // Relación inversa: una bodega puede tener muchos inventarios
  @OneToMany(() => Inventario, (inv) => inv.bodega)
  inventarios: Inventario[];

  // Relación inversa: una bodega puede registrar muchos movimientos
  @OneToMany(() => Movimiento, (mov) => mov.bodega)
  movimientos: Movimiento[];
}
