import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Presentacion } from './presentacion.entity';
import { UnidadMedida } from './unidadmedida.entity';
import { Proveedor } from './proveedor.entity';
// import { Movimiento } from './movimiento.entity';
import { Inventario } from './inventario.entity';

@Entity({ name: 'producto' })
export class Producto {
  @PrimaryGeneratedColumn({ name: 'idproducto' })
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'enum', enum: ['MATERIA_PRIMA', 'INSUMO', 'ENVASE'] })
  tipoProducto: 'MATERIA_PRIMA' | 'INSUMO' | 'ENVASE';

  @Column({ type: 'varchar', length: 45, nullable: true })
  subtipoInsumo: string; // opcional, si aplica

  @Column({ type: 'enum', enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';

  @ManyToOne(() => Presentacion, (p) => p.productos, { eager: true })
  @JoinColumn({ name: 'presentacion_idpresentacion' })
  presentacion: Presentacion;

  @ManyToOne(() => UnidadMedida, (u) => u.productos, { eager: true })
  @JoinColumn({ name: 'unidadmedida_idunidadmedida' })
  unidadMedida: UnidadMedida;

  @ManyToOne(() => Proveedor, (pr) => pr.productos, { eager: true })
  @JoinColumn({ name: 'proveedor_idproveedor' })
  proveedor: Proveedor;

  //   @OneToMany(() => Movimiento, (mov) => mov.producto)
  //   movimientos: Movimiento[];

  @OneToMany(() => Inventario, (inv) => inv.producto)
  inventarios: Inventario[];
}
