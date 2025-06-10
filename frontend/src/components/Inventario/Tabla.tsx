import React from 'react';
import DataTable from '../ui/DataTable';

const columns = [
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Descripción', accessor: 'descripcion' },
  { header: 'Tipo', accessor: 'tipo' },
  { header: 'Unidad de Medida', accessor: 'unidad_medida' },
  { header: 'Stock minimo', accessor: 'stock_min' },
  { header: 'Stock actual', accessor: 'stock_act' },
  { header: 'Estado', accessor: 'estado' },
];

const data = [
  { nombre: 'Producto A', descripcion: 'Descripción A', tipo: 'Tipo A', unidad_medida: 'Kg', stock_min: 50,stock_act:500, estado: 'Activo' },
  { nombre: 'Producto B', descripcion: 'Descripción B', tipo: 'Tipo B', unidad_medida: 'Litros', stock_min: 30, stock_act:500, estado: 'Inactivo' },
  { nombre: 'Producto C', descripcion: 'Descripción C', tipo: 'Tipo C', unidad_medida: 'Unidades', stock_min: 100, stock_act:500, estado: 'Activo' },
];

function Tabla() {
  return (
    <div>
      
      <DataTable columns={columns} data={data} />
    </div>
  );
}

export default Tabla;
