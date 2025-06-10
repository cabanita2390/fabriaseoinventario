import React, { useState } from 'react';
import Home from '../../components/Home';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header } from '../../styles/Insumos.css';
import Swal from 'sweetalert2';

const initialForm = {
  codigo: '',
  nombre: '',
  cantidad: '',
  tipo: '',
  estado: '',
  descripcion: '',
  presentacion: '',
  unidad: '',
  proveedor: '',
  bodega: '',
};

const InsumosPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [tipoActual, setTipoActual] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const [materiaPrima, setMateriaPrima] = useState<any[]>([]);
  const [insumos, setInsumos] = useState<any[]>([]);
  const [etiquetas, setEtiquetas] = useState<any[]>([]);

  const columnas = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Cantidad', accessor: 'cantidad' },
    { header: 'Tipo', accessor: 'tipo' },
    { header: 'Estado', accessor: 'estado' },
    { header: 'Descripción', accessor: 'descripcion' },
    { header: 'Presentación', accessor: 'presentacion' },
    { header: 'Unidad', accessor: 'unidad' },
    { header: 'Proveedor', accessor: 'proveedor' },
    { header: 'Bodega', accessor: 'bodega' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (tipo: string) => {
    setForm({ ...initialForm, tipo });
    setTipoActual(tipo);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (row: any, tipo: string) => {
    setForm(row);
    setTipoActual(tipo);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (row: any, tipo: string) => {
    Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const setter = tipo === 'Materia Prima' ? setMateriaPrima : tipo === 'Etiqueta' ? setEtiquetas : setInsumos;
        const getter = tipo === 'Materia Prima' ? materiaPrima : tipo === 'Etiqueta' ? etiquetas : insumos;
        setter(getter.filter((item) => item.codigo !== row.codigo));
        Swal.fire('¡Eliminado!', 'El registro fue eliminado.', 'success');
      }
    });
  };

  const handleSave = () => {
    try {
      const nuevoRegistro = { ...form, codigo: form.codigo || String(Date.now()) };
      const setter = tipoActual === 'Materia Prima' ? setMateriaPrima : tipoActual === 'Etiqueta' ? setEtiquetas : setInsumos;
      const getter = tipoActual === 'Materia Prima' ? materiaPrima : tipoActual === 'Etiqueta' ? etiquetas : insumos;

      if (isEditMode) {
        setter(getter.map((item) => (item.codigo === form.codigo ? nuevoRegistro : item)));
      } else {
        setter([...getter, nuevoRegistro]);
      }

      setShowModal(false);
      setForm(initialForm);
      setIsEditMode(false);
      Swal.fire('¡Éxito!', 'Registro guardado correctamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar el registro.', 'error');
    }
  };

  return (
    <Home>
      {/* MATERIA PRIMA */}
      <Header>
        <h2>Materia Prima</h2>
        <Button onClick={() => handleOpenModal('Materia Prima')}>Agregar</Button>
      </Header>
      <DataTable columns={columnas} data={materiaPrima} onEdit={(row) => handleEdit(row, 'Materia Prima')} onDelete={(row) => handleDelete(row, 'Materia Prima')} />

      {/* INSUMOS */}
      <Header>
        <h2>Insumos</h2>
        <Button onClick={() => handleOpenModal('Insumo')}>Agregar</Button>
      </Header>
      <DataTable columns={columnas} data={insumos} onEdit={(row) => handleEdit(row, 'Insumo')} onDelete={(row) => handleDelete(row, 'Insumo')} />

      {/* ETIQUETAS */}
      <Header>
        <h2>Etiquetas</h2>
        <Button onClick={() => handleOpenModal('Etiqueta')}>Agregar</Button>
      </Header>
      <DataTable columns={columnas} data={etiquetas} onEdit={(row) => handleEdit(row, 'Etiqueta')} onDelete={(row) => handleDelete(row, 'Etiqueta')} />

      {/* MODAL */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? `Editar ${tipoActual}` : `Agregar ${tipoActual}`}
          </h2>

          <Input label="Código" name="codigo" value={form.codigo} onChange={handleChange} disabled={isEditMode} />
          <Select label="Nombre del Insumo" name="nombre" value={form.nombre} onChange={handleChange} options={['Insumo A', 'Insumo B']} />
          <Input label="Cantidad" name="cantidad" value={form.cantidad} onChange={handleChange} type="number" />
          <Select label="Tipo" name="tipo" value={form.tipo} onChange={handleChange} options={["Entrada", "Salida"]} />
          <Select label="Estado" name="estado" value={form.estado} onChange={handleChange} options={["Activo", "Inactivo"]} />
          <Input label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} />
          <Select label="Presentación" name="presentacion" value={form.presentacion} onChange={handleChange} options={["Botella", "Caja", "Bolsa"]} />
          <Select label="Unidad de Medida" name="unidad" value={form.unidad} onChange={handleChange} options={["Litros", "Gramos", "Unidades"]} />
          <Select label="Proveedor" name="proveedor" value={form.proveedor} onChange={handleChange} options={["Proveedor A", "Proveedor B"]} />
          <Select label="Bodega" name="bodega" value={form.bodega} onChange={handleChange} options={["Bodega 1", "Bodega 2"]} />

          <ModalFooter>
            <Button onClick={handleSave}>Guardar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default InsumosPage;
