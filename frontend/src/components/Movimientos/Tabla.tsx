import React from 'react';
import '../../styles/Movimientos/movimientos.css';
import Filtro from './Filtro';
import DataTable from '../ui/DataTable'; // Asegúrate de que la ruta sea correcta


function Tabla() {
  // Definición de columnas
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Tipo', accessor: 'tipo' },
    { header: 'Estado', accessor: 'estado' },
    { header: 'Presentación', accessor: 'presentacion' },
    { header: 'UM', accessor: 'unidad_medida' },
    { header: 'Proveedor', accessor: 'proveedor' },
    { header: 'Inventario', accessor: 'inventario' },
  ];

  // Datos de ejemplo (esto normalmente vendría de una API o estado)
  const data = [
    {
      id: 1,
      nombre: 'Producto A',
      tipo: 'Insumo',
      estado: 'Activo',
      presentacion: 'Caja',
      unidad_medida: 'Unidad',
      proveedor: 'Proveedor X',
      inventario: 25,
    },
  ];

  // Funciones de acción
  const handleEdit = (row: any) => {
    console.log('Editar', row);
    // Aquí va la lógica para editar
  };

  const handleDelete = (row: any) => {
    console.log('Eliminar', row);
    // Aquí va la lógica para eliminar
  };

  return (
    <div>
      <div>
        <Filtro />
      </div>

      <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default Tabla;