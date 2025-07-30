import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/Searchbar';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuthFetch , ApiError } from '../../components/ui/useAuthFetch';
import ExportToExcel from '../../components/ui/ExportToExcel';
type UnidadMedida = {
  id?: number;
  nombre: string;
};

const initialForm: Omit<UnidadMedida, 'id'> = {
  nombre: '',
};

const UnidadesPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<UnidadMedida>(initialForm);
  const [data, setData] = useState<UnidadMedida[]>([]);
  const [filtro, setFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authFetch } = useAuthFetch(); 
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
  ];

  const unidadesFiltradas = data.filter((unidad) =>
    unidad.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await authFetch ('http://localhost:3000/unidadmedida');
        if (!response.ok) {
          throw new Error('Error al cargar las unidades de medida');
        }
        const unidades = await response.json();
        setData(unidades);
      } catch (error) {
        console.error("Error cargando unidades:", error);
        const errorMessage = error instanceof Error ? error.message : 'No se pudieron cargar las unidades de medida';
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      Swal.fire('Campo obligatorio', 'El nombre es requerido', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      const payload = { nombre: form.nombre.trim() };

      if (isEditMode && form.id) {
        response = await authFetch (`http://localhost:3000/unidadmedida/${form.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await authFetch('http://localhost:3000/unidadmedida', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la unidad');
      }

      const updatedResponse = await authFetch('http://localhost:3000/unidadmedida');
      const updatedData = await updatedResponse.json();
      setData(updatedData);

      Swal.fire('¡Guardado!', 'La unidad fue registrada correctamente', 'success');
      setForm(initialForm);
      setShowModal(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al guardar la unidad';
      Swal.fire('¡Error!', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row: UnidadMedida) => {
    setForm({
      nombre: row.nombre,
      ...(row.id && { id: row.id })
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (row: UnidadMedida) => {
    const result = await Swal.fire({
      title: '¿Eliminar unidad?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await authFetch(`http://localhost:3000/unidadmedida/${row.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error al eliminar la unidad');
        }

        const updatedResponse = await authFetch('http://localhost:3000/unidadmedida');
        const updatedData = await updatedResponse.json();
        setData(updatedData);

        Swal.fire('Eliminado', 'La unidad ha sido eliminada.', 'success');
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'No se pudo eliminar la unidad';
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Home>
      <div className="export-excel-container">
        <ExportToExcel 
      data={unidadesFiltradas} 
      filename="unidades_de_medida"
      buttonText="Exportar a Excel"
        />
            
      </div>
      
      <Header>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <SearchBar 
            onSearch={setFiltro} 
            placeholder="Buscar unidad de medida..." 
            className="search-bar-container" 
          />
          <BackButton onClick={() => navigate('/gestion')}>
            <FaArrowLeft style={{ marginRight: '8px' }} /> Volver a Gestión
          </BackButton>
          <Button
            onClick={() => {
              setForm(initialForm);
              setIsEditMode(false);
              setShowModal(true);
            }}
            disabled={isLoading}
          >
            Agregar Unidad
          </Button>
        </div>
      </Header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>
      ) : (
        <DataTable<UnidadMedida>
          columns={columns}
          data={unidadesFiltradas}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <Modal onClose={() => !isLoading && setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Unidad' : 'Agregar Unidad'}
          </h2>

          <Input
            label="Nombre *"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <ModalFooter>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button onClick={() => !isLoading && setShowModal(false)} disabled={isLoading}>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default UnidadesPage;