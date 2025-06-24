import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/Movimientos/movimientos.css';
import Filtro from './Filtro';
import DataTable from '../ui/DataTable';
import { FieldConfig } from '../types/FieldConfig';
import Modal from '../ui/Modal';
import { ModalFooter } from '../../styles/ui/Modal.css';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Swal from 'sweetalert2';
import styled from 'styled-components';
interface RowData {
  id: number;
  tipo: string;
  producto: string;
  cantidad: number;
  fecha: string;
  descripcion: string;
  unidad: string;
  proveedor: string;
  bodega: string;
  producto_id?: number;
  bodega_id?: number;
}

interface ProductoAgrupado {
  id: number;
  nombre: string;
  tipoProducto: string;
  estado: string;
  unidadMedida?: { id: number; nombre: string };
  proveedor?: { id: number; nombre: string } | null;
  presentaciones: { id: number; nombre: string }[];
}

interface Bodega {
  id: number;
  nombre: string;
}

const filtros: FieldConfig[] = [
  { tipo: 'date', id: 'fechaInicio', label: 'Fecha de inicio' },
  { tipo: 'date', id: 'fechaFin', label: 'Fecha fin' },
];

function Tabla({ mostrarFiltro = true, mostrarExportar = true }: { mostrarFiltro?: boolean; mostrarExportar?: boolean }) {
  const [data, setData] = useState<RowData[]>([]);
  const [fullData, setFullData] = useState<RowData[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [editando, setEditando] = useState<RowData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoAgrupado[]>([]);
  const [bodegasDisponibles, setBodegasDisponibles] = useState<Bodega[]>([]);
  const [productosOriginales, setProductosOriginales] = useState<any[]>([]);

  const handleEdit = useCallback((movimiento: RowData) => {
    setEditando(movimiento);
    cargarDatosRelacionados();
    setShowEditModal(true);
  }, []);

  const columns = [
    { header: "Tipo", accessor: "tipo" },
    { header: "Producto", accessor: "producto" },
    { header: "Cantidad", accessor: "cantidad" },
    { header: "Unidad", accessor: "unidad" },
    { header: "Descripción", accessor: "descripcion" },
    { header: "Proveedor", accessor: "proveedor" },
    { header: "Bodega", accessor: "bodega" },
    { header: "Fecha", accessor: "fecha" },
  ];

  const cargarProductos = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/producto');
      const data = await res.json();

      setProductosOriginales(data);

      const agrupados: ProductoAgrupado[] = [];
      for (const producto of data) {
        const existente = agrupados.find(p => p.nombre === producto.nombre);
        if (existente) {
          if (!existente.presentaciones.some(pr => pr.id === producto.presentacion.id)) {
            existente.presentaciones.push(producto.presentacion);
          }
        } else {
          agrupados.push({
            ...producto,
            presentaciones: [producto.presentacion],
          });
        }
      }

      setProductosDisponibles(agrupados);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  }, []);

  const cargarBodegas = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/bodega');
      const data = await res.json();
      setBodegasDisponibles(data);
    } catch (err) {
      console.error("Error cargando bodegas:", err);
    }
  }, []);

  const cargarDatosRelacionados = useCallback(async () => {
    await Promise.all([cargarProductos(), cargarBodegas()]);
  }, [cargarProductos, cargarBodegas]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/movimiento');
        const json = await response.json();

        const movimientos: RowData[] = json.map((mov: any) => ({
          id: mov.id,
          tipo: mov.tipo === 'INGRESO' ? 'Entrada' : 'Salida',
          producto: mov.producto?.nombre || '',
          cantidad: mov.cantidad,
          fecha: mov.fechaMovimiento.split('T')[0],
          descripcion: mov.descripcion || '',
          unidad: mov.producto?.unidadMedida?.nombre || '',
          proveedor: mov.producto?.proveedor?.nombre || '',
          bodega: mov.bodega?.nombre || '',
          producto_id: mov.producto?.id,
          bodega_id: mov.bodega?.id,
        }));

        setData(movimientos);
        setFullData(movimientos);
      } catch (error) {
        console.error("Error al cargar los movimientos:", error);
      }
    };
    fetchData();
  }, []);

  const handleBuscar = (values: Record<string, string>) => {
    const { fechaInicio, fechaFin } = values;

    const filtrado = fullData.filter(({ fecha, producto, descripcion, proveedor, bodega, tipo }) => {
      const itemFecha = new Date(fecha);
      if (fechaInicio && itemFecha < new Date(fechaInicio)) return false;
      if (fechaFin && itemFecha > new Date(fechaFin)) return false;

      const texto = filtroTexto.toLowerCase();
      return (
        producto.toLowerCase().includes(texto) ||
        descripcion.toLowerCase().includes(texto) ||
        proveedor.toLowerCase().includes(texto) ||
        bodega.toLowerCase().includes(texto) ||
        tipo.toLowerCase().includes(texto)
      );
    });

    setData(filtrado);
  };

  useEffect(() => {
    handleBuscar({});
  }, [filtroTexto]);

  const exportToCSV = () => {
    const headers = columns
      .map(c => c.header)
      .join(',');
      
    const rows = data.map(row =>
      columns
        .map(c => `"${row[c.accessor as keyof RowData] ?? ""}"`)
        .join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'movimientos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (!editando) return;

    if (name === "producto") {
      const seleccionado = productosDisponibles.find(p => p.nombre === value);
      const productoOriginal = productosOriginales.find(p => 
        p.nombre === value && 
        p.presentacion.id === editando.producto_id
      );

      setEditando(prev => ({
        ...prev!,
        producto: value,
        producto_id: productoOriginal?.id || prev?.producto_id,
        unidad: seleccionado?.unidadMedida?.nombre || '',
        proveedor: seleccionado?.proveedor?.nombre || '',
      }));
      return;
    }

    if (name === "bodega") {
      const bodegaSeleccionada = bodegasDisponibles.find(b => b.nombre === value);
      setEditando(prev => ({
        ...prev!,
        bodega: value,
        bodega_id: bodegaSeleccionada?.id || prev?.bodega_id,
      }));
      return;
    }

    setEditando(prev => ({
      ...prev!,
      [name]: name === "cantidad" ? Number(value) : value,
    }));
  };

  const handleUpdate = async () => {
    if (!editando) return;

    if (
      !editando.producto ||
      !editando.cantidad ||
      !editando.bodega ||
      editando.bodega === "seleccione una opcion" ||
      editando.cantidad <= 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos requeridos y asegúrate que la cantidad sea mayor a 0.",
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Actualizando movimiento',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Payload corregido sin fechaMovimiento
      const payload = {
        tipo: editando.tipo === 'Entrada' ? 'INGRESO' : 'EGRESO',
        cantidad: editando.cantidad,
        descripcion: editando.descripcion,
        producto_idproducto: editando.producto_id,
        bodega_idbodega: editando.bodega_id
      };

      const response = await fetch(`http://localhost:3000/movimiento/${editando.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el movimiento');
      }

      const updatedData = data.map(item => 
        item.id === editando.id ? editando : item
      );
      
      setData(updatedData);
      setFullData(updatedData);
      
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "El movimiento ha sido actualizado correctamente.",
      });

      setShowEditModal(false);
      setEditando(null);
    } catch (error) {
      console.error("Error al actualizar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar el movimiento. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditando(null);
  };
// Definición de componentes estilizados para los botones
const CancelButton = styled.button`
  padding: 0.5rem 1.25rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 10px;

  &:hover {
    background-color: #d32f2f;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1.25rem;
  background-color: rgb(6, 77, 170);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: rgb(49, 64, 84);
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

// ... (el resto de tus interfaces y código permanece igual hasta el return)

return (
  <div>
    {mostrarFiltro && (
      <Filtro
        fields={filtros}
        onSearch={handleBuscar}
        onTextoChange={setFiltroTexto}
        onExport={mostrarExportar ? exportToCSV : undefined}
      />
    )}
    
    <DataTable 
      columns={columns} 
      data={data} 
      onEdit={handleEdit}
    />
    
    {showEditModal && editando && (
      <Modal onClose={closeModal}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          minWidth: '500px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{ 
            textAlign: "center", 
            marginBottom: "1.5rem",
            color: "#1B293D"
          }}>
            Editar Movimiento
          </h2>
          
          <Select
            label="Tipo"
            name="tipo"
            value={editando.tipo}
            onChange={handleChange}
            options={["Entrada", "Salida"]}
          />
          
          <Select
            label="Producto"
            name="producto"
            value={editando.producto || "seleccione una opcion"}
            onChange={handleChange}
            options={["seleccione una opcion", ...productosDisponibles.map((p) => p.nombre)]}
          />
          
          <Input 
            label="Cantidad"
            type="number"
            name="cantidad"
            value={editando.cantidad}
            onChange={handleChange}
          />
          
          <Input 
            label="Unidad"
            value={editando.unidad}
            onChange={() => {}}
            disabled={true}
          />
          
          <Input 
            label="Proveedor"
            value={editando.proveedor}
            onChange={() => {}}
            disabled={true}
          />
          
          <Select
            label="Bodega"
            name="bodega"
            value={editando.bodega || "seleccione una opcion"}
            onChange={handleChange}
            options={["seleccione una opcion", ...bodegasDisponibles.map((b) => b.nombre)]}
          />
          
          <Input 
            label="Fecha"
            type="date"
            name="fecha"
            value={editando.fecha}
            onChange={handleChange}
            disabled={true}
          />
          
          <Input
            label="Descripción"
            name="descripcion"
            value={editando.descripcion}
            onChange={handleChange}
          />
          
          <ModalFooter>
            <CancelButton onClick={closeModal}>
              Cancelar
            </CancelButton>
            <SaveButton onClick={handleUpdate}>
              Guardar Cambios
            </SaveButton>
          </ModalFooter>
        </div>
      </Modal>
    )}
  </div>
);
}

export default Tabla;