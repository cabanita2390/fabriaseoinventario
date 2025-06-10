import React, { useState } from 'react';
import Home from '../../components/Home';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { Header } from '../../styles/Insumos.css';
import Swal from 'sweetalert2';

const EtiquetasPage = () => {
  const [etiquetas, setEtiquetas] = useState<any[]>([]);

  const columnas = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Cantidad', accessor: 'cantidad' },
    { header: 'Estado', accessor: 'estado' },
    { header: 'Descripción', accessor: 'descripcion' },
    { header: 'Presentación', accessor: 'presentacion' },
    { header: 'Unidad', accessor: 'unidad' },
    { header: 'Bodega', accessor: 'bodega' },
  ];

  const handleDelete = (row: any) => {
    Swal.fire({
      title: '¿Eliminar etiqueta?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setEtiquetas(etiquetas.filter((item) => item.codigo !== row.codigo));
        Swal.fire('¡Eliminado!', 'La etiqueta fue eliminada.', 'success');
      }
    });
  };

  return (
    <Home>
      <Header>
        <h2>Etiquetas</h2>
        <Button onClick={() => alert("Abrir modal para registrar etiqueta")}>Agregar</Button>
      </Header>
      <DataTable columns={columnas} data={etiquetas} onDelete={handleDelete} />
    </Home>
  );
};

export default EtiquetasPage;
