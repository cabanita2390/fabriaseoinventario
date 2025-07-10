import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Producto } from './producto.entity';

@Entity({ name: 'presentacion' })
export class Presentacion {
  @PrimaryGeneratedColumn({ name: 'idpresentacion' })
  id: number;

  @Column({ length: 45 })
  nombre: string;

  @Column({
    name: 'tipo_producto',
    type: 'enum',
    enum: ['MATERIA_PRIMA', 'MATERIAL_DE_ENVASE', 'ETIQUETAS'],
  })
  tipoProducto: 'MATERIA_PRIMA' | 'MATERIAL_DE_ENVASE' | 'ETIQUETAS';

  @OneToMany(() => Producto, (producto) => producto.presentacion)
  productos: Producto[];
}
