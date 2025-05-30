// src/entities/producto.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
// import { Presentacion } from './presentacion.entity';
// import { UnidadMedida } from './unidadmedida.entity';
// import { Proveedor } from './proveedor.entity';
// import { Movimiento } from './movimiento.entity';
// import { Inventario } from './inventario.entity';

//Prueba nueva rama

@Entity({ name: 'producto' })
export class Producto {
  @PrimaryGeneratedColumn({ name: 'idproducto' })
  id: number;

  @Column({ length: 45 })
  nombre: string;

  @Column({ type: 'enum', enum: ['MATERIA_PRIMA', 'INSUMO', 'ENVASE'] })
  tipo_producto: string;

  @Column({ type: 'enum', enum: ['SUBTIPO1', 'SUBTIPO2'], nullable: true })
  subtipo_insumo: string;

  @Column({ type: 'enum', enum: ['ACTIVO', 'INACTIVO'] })
  estado: string;

  //   @ManyToOne(() => Presentacion, p => p.productos)
  //   @JoinColumn({ name: 'presentacion_idpresentacion' })
  //   presentacion: Presentacion;

  //   @ManyToOne(() => UnidadMedida, u => u.productos)
  //   @JoinColumn({ name: 'unidadmedida_idunidadmedida' })
  //   unidadMedida: UnidadMedida;

  //   @ManyToOne(() => Proveedor, pr => pr.productos)
  //   @JoinColumn({ name: 'proveedor_idproveedor' })
  //   proveedor: Proveedor;

  //   @OneToMany(() => Movimiento, m => m.producto)
  //   movimientos: Movimiento[];

  //   @OneToMany(() => Inventario, inv => inv.producto)
  //   inventarios: Inventario[];
}
