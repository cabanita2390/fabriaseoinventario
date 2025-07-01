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
type Presentacion = {
  id?: number;
  nombre: string;
};

const initialForm: Presentacion = {
  nombre: ''
};



const PresentacionPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Presentacion>(initialForm);
  const [data, setData] = useState<Presentacion[]>([]);
  const [fullData, setFullData] = useState<Presentacion[]>([]);
  const [filtro, setFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authFetch } = useAuthFetch();

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
  ];

  const datosFiltrados = fullData.filter((presentacion) =>
    presentacion.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await authFetch ('http://localhost:3000/presentacion');
        if (!response.ok) throw new Error('Error al cargar presentaciones');
        const presentaciones = await response.json();
        setData(presentaciones);
        setFullData(presentaciones);
      } catch (error) {
        console.error("Error cargando presentaciones:", error);
        let errorMessage = 'No se pudieron cargar las presentaciones';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
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
      Swal.fire('Error', 'El nombre es obligatorio', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const method = isEditMode ? 'PATCH' : 'POST';
      const url = isEditMode 
        ? `http://localhost:3000/presentacion/${form.id}`
        : 'http://localhost:3000/presentacion';

      const response =  await authFetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ nombre: form.nombre })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(errorText || 'Error al guardar la presentación');
      }

      const result = await response.json();
      
      if (isEditMode) {
        setData(prev => prev.map(p => p.id === form.id ? result : p));
        setFullData(prev => prev.map(p => p.id === form.id ? result : p));
      } else {
        setData(prev => [...prev, result]);
        setFullData(prev => [...prev, result]);
      }

      Swal.fire('Éxito', `Presentación ${isEditMode ? 'actualizada' : 'creada'} correctamente`, 'success');
      setShowModal(false);
      setForm(initialForm);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Error al guardar la presentación';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row: Presentacion) => {
    if (!row.id) {
      Swal.fire('Error', 'La presentación seleccionada no tiene ID válido', 'error');
      return;
    }
    setForm(row);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (row: Presentacion) => {
    if (!row.id) return;
    
    const result = await Swal.fire({
      title: '¿Eliminar presentación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await authFetch(`http://localhost:3000/presentacion/${row.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        setData(prev => prev.filter(p => p.id !== row.id));
        setFullData(prev => prev.filter(p => p.id !== row.id));
        
        Swal.fire('Eliminado', 'La presentación ha sido eliminada.', 'success');
      } catch (error) {
        console.error('Error:', error);
        let errorMessage = 'No se pudo eliminar la presentación';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Home>
      <Header>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <SearchBar
            onSearch={setFiltro}
            placeholder="Buscar presentación..."
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
            Agregar Presentación
          </Button>
        </div>
      </Header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={datosFiltrados}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <Modal onClose={() => !isLoading && setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Presentación' : 'Agregar Presentación'}
          </h2>

          <Input
            label="Nombre *"
            id="nombrePresentacion"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            disabled={isLoading}
            required
          />

          <ModalFooter>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button 
              onClick={() => !isLoading && setShowModal(false)} 
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default PresentacionPage;