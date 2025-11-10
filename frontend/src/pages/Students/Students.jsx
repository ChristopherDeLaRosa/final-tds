// src/pages/Students.jsx  (ajusta la ruta si tu archivo vive en otra carpeta)
import { useState, useEffect } from 'react';
import { DataTable } from '../../components';
import { theme } from '../../styles';
import styled from 'styled-components';
import Modal from '../../components/molecules/Modal/Modal';
import estudianteService from '../../services/estudianteService';

// Helpers centralizados de SweetAlert2
import { MySwal, Toast } from '../../utils/alerts';

// ----------------- STYLES -----------------
const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  background: ${theme.colors.bg};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  color: ${theme.colors.text};
  font-Size: ${theme.fontSize.xxl};
  font-weight: 600;
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.sm};
  margin: 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.accent};
  color: ${theme.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: ${theme.transition};
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.3);
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.accentHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${theme.colors.bgDark};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  border-left: 4px solid ${props => props.$accentColor || theme.colors.accent};
  transition: ${theme.transition};
  
  &:hover {
    background: ${theme.colors.bgHover};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const StatLabel = styled.p`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const StatValue = styled.p`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const TableCard = styled.div`
  background: ${theme.colors.bgDark};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

const Badge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.xs};
  background-color: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  border: 1px solid ${props => props.$borderColor};
  white-space: nowrap;
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.lg};
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-left: 4px solid #ef4444;
  color: #ef4444;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  &::before {
    content: '⚠';
    font-size: 24px;
  }
`;

const MatriculaBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(79, 140, 255, 0.1);
  color: ${theme.colors.accent};
  border: 1px solid rgba(79, 140, 255, 0.3);
  font-size: 12px;
`;

// Form styles
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns || '1fr'};
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  
  ${props => props.$required && `
    &::after {
      content: ' *';
      color: #ef4444;
    }
  `}
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border: 1px solid ${props => props.$error ? '#ef4444' : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  transition: ${theme.transition};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : theme.colors.accent};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 140, 255, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${theme.colors.bgDark};
  }
  
  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: ${theme.fontSize.xs};
  margin-top: -${theme.spacing.xs};
`;

const ModalButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: ${theme.transition};
  border: none;
  
  ${props => props.$variant === 'primary' && `
    background: ${theme.colors.accent};
    color: ${theme.colors.text};
    
    &:hover {
      background: ${theme.colors.accentHover};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  `}
  
  ${props => props.$variant === 'danger' && `
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }
  `}
  
  ${props => props.$variant === 'secondary' && `
    background: transparent;
    color: ${theme.colors.textMuted};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.bgHover};
      color: ${theme.colors.text};
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

// ----------------- COMPONENT -----------------
export default function Students() {
  // Estados
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal de crear/editar
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [formData, setFormData] = useState({
    matricula: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    activo: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    fetchEstudiantes();
  }, []);

  // Función para obtener estudiantes de la API
  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await estudianteService.getAll();
      setEstudiantes(data);
    } catch (err) {
      setError('Error al cargar los estudiantes. Por favor, verifica tu conexión e intenta de nuevo.');
      console.error('Error fetching estudiantes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Definición de columnas para la tabla
  const columns = [
    { key: 'id', title: 'ID', width: '60px' },
    { 
      key: 'matricula', 
      title: 'Matrícula',
      width: '120px',
      render: (value) => <MatriculaBadge>{value}</MatriculaBadge>
    },
    { key: 'nombreCompleto', title: 'Nombre Completo' },
    { key: 'email', title: 'Correo Electrónico' },
    { key: 'telefono', title: 'Teléfono', width: '130px' },
    {
      key: 'activo',
      title: 'Estado',
      width: '100px',
      render: (value) => (
        <Badge
          $bgColor={value ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
          $textColor={value ? '#10b981' : '#ef4444'}
          $borderColor={value ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
        >
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
  ];

  // Validación del formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.matricula.trim()) {
      errors.matricula = 'La matrícula es requerida';
    }
    if (!formData.nombres.trim()) {
      errors.nombres = 'Los nombres son requeridos';
    } else if (formData.nombres.trim().length < 2) {
      errors.nombres = 'Los nombres deben tener al menos 2 caracteres';
    }
    if (!formData.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.trim().length < 2) {
      errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler para cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handler para abrir modal de crear estudiante
  const handleAddStudent = () => {
    setSelectedEstudiante(null);
    setFormData({
      matricula: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      fechaIngreso: new Date().toISOString().split('T')[0],
      activo: true,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Handler para editar estudiante
  const handleEdit = (estudiante) => {
    const formatearFecha = (fecha) => {
      if (!fecha) return '';
      return String(fecha).split('T')[0];
    };
    
    setSelectedEstudiante(estudiante);
    setFormData({
      matricula: estudiante.matricula || '',
      nombres: estudiante.nombres || '',
      apellidos: estudiante.apellidos || '',
      email: estudiante.email || '',
      telefono: estudiante.telefono || '',
      direccion: estudiante.direccion || '',
      fechaNacimiento: formatearFecha(estudiante.fechaNacimiento),
      fechaIngreso: formatearFecha(estudiante.fechaIngreso),
      activo: estudiante.activo ?? true,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Guardar estudiante (crear o editar)
  const handleSaveStudent = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!validateForm()) {
      Toast.fire({ icon: 'info', title: 'Revisa los campos obligatorios' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Loader mientras guarda (sin await)
      MySwal.fire({
        title: 'Guardando...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => MySwal.showLoading(),
      });

      // Formatear fechas para la API
      const dataToSend = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento ? `${formData.fechaNacimiento}T00:00:00` : null,
        fechaIngreso: formData.fechaIngreso ? `${formData.fechaIngreso}T00:00:00` : null,
      };

      if (selectedEstudiante) {
        await estudianteService.update(selectedEstudiante.id, dataToSend);
        MySwal.close();
        Toast.fire({ icon: 'success', title: 'Estudiante actualizado' });
      } else {
        await estudianteService.create(dataToSend);
        MySwal.close();
        Toast.fire({ icon: 'success', title: 'Estudiante creado' });
      }
      
      // Recargar lista
      await fetchEstudiantes();
      
      // Cerrar modal
      setIsFormModalOpen(false);
      setSelectedEstudiante(null);
    } catch (err) {
      MySwal.close();

      if (err.response?.data?.message) {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response.data.message,
          confirmButtonText: 'Entendido',
        });
      } else if (err.response?.data?.errors) {
        const html = Object.values(err.response.data.errors)
          .flat()
          .map(msg => `<li>${msg}</li>`)
          .join('');
        MySwal.fire({
          icon: 'error',
          title: 'Errores de validación',
          html: `<ul style="text-align:left;margin:0;padding-left:1rem">${html}</ul>`,
          confirmButtonText: 'Corregir',
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: 'Intenta de nuevo.',
        });
      }
      console.error('Error saving estudiante:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar estudiante con confirmación SweetAlert
  const handleDelete = async (estudiante) => {
    const nombre = estudiante?.nombreCompleto || `${estudiante?.nombres} ${estudiante?.apellidos}` || 'este estudiante';

    const { isConfirmed } = await MySwal.fire({
      title: `¿Eliminar a ${nombre}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      // Deja que el estilo global pinte los botones; si quieres rojo fijo:
      // confirmButtonColor: '#ef4444',
    });

    if (!isConfirmed) return;

    try {
      MySwal.fire({
        title: 'Eliminando...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => MySwal.showLoading(),
      });

      await estudianteService.delete(estudiante.id);
      setEstudiantes(prev => prev.filter(e => e.id !== estudiante.id));

      MySwal.close();
      Toast.fire({ icon: 'success', title: 'Estudiante eliminado' });
    } catch (err) {
      MySwal.close();
      MySwal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: 'Por favor, intenta de nuevo.',
      });
      console.error('Error deleting estudiante:', err);
    }
  };

  // Cerrar modal de formulario
  const handleCloseFormModal = () => {
    if (!isSubmitting) {
      setIsFormModalOpen(false);
      setSelectedEstudiante(null);
      setFormErrors({});
    }
  };

  // Calcular estadísticas
  const totalEstudiantes = estudiantes.length;
  const estudiantesActivos = estudiantes.filter(e => e.activo).length;
  const estudiantesInactivos = estudiantes.filter(e => !e.activo).length;

  // Loading
  if (loading) {
    return (
      <PageContainer>
        <LoadingOverlay>
          <div>Cargando estudiantes...</div>
        </LoadingOverlay>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Mensaje de error si existe */}
      {error && (
        <ErrorMessage>
          <div>
            <strong>Error:</strong> {error}
            <div style={{ marginTop: '8px' }}>
              <button 
                onClick={async () => {
                  try {
                    MySwal.fire({
                      title: 'Recargando...',
                      didOpen: () => MySwal.showLoading(),
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                    });
                    await fetchEstudiantes();
                    MySwal.close();
                    Toast.fire({ icon: 'success', title: 'Lista actualizada' });
                  } catch {
                    MySwal.close();
                    MySwal.fire({
                      icon: 'error',
                      title: 'No se pudo recargar',
                      text: 'Verifica tu conexión.',
                    });
                  }
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Reintentar
              </button>
            </div>
          </div>
        </ErrorMessage>
      )}

      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>Gestión de Estudiantes</Title>
          <Subtitle>Sistema de registro escolar - EduCore</Subtitle>
        </HeaderContent>
        
        <AddButton onClick={handleAddStudent} disabled={loading}>
          <span style={{ fontSize: '18px' }}>+</span>
          Agregar Estudiante
        </AddButton>
      </Header>

      {/* Tarjetas de estadísticas */}
      <StatsGrid>
        <StatCard $accentColor={theme.colors.accent}>
          <StatLabel>Total Estudiantes</StatLabel>
          <StatValue>{totalEstudiantes}</StatValue>
        </StatCard>

        <StatCard $accentColor="#10b981">
          <StatLabel>Estudiantes Activos</StatLabel>
          <StatValue>{estudiantesActivos}</StatValue>
        </StatCard>

        <StatCard $accentColor="#ef4444">
          <StatLabel>Estudiantes Inactivos</StatLabel>
          <StatValue>{estudiantesInactivos}</StatValue>
        </StatCard>
      </StatsGrid>

      {/* Tabla de estudiantes */}
      <TableCard>
        <DataTable
          data={estudiantes}
          columns={columns}
          searchFields={['nombreCompleto', 'nombres', 'apellidos', 'email', 'matricula', 'telefono']}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          emptyMessage="No hay estudiantes registrados. ¡Agrega el primero!"
          loadingMessage="Cargando estudiantes..."
        />
      </TableCard>

      {/* Modal de crear/editar estudiante */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={selectedEstudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        size="large"
        closeOnOverlayClick={!isSubmitting}
        footer={
          <>
            <ModalButton 
              $variant="secondary" 
              type="button" 
              onClick={handleCloseFormModal} 
              disabled={isSubmitting}
            >
              Cancelar
            </ModalButton>
            <ModalButton 
              $variant="primary" 
              type="button" 
              onClick={handleSaveStudent} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : selectedEstudiante ? 'Actualizar' : 'Crear'}
            </ModalButton>
          </>
        }
      >
        {/* Evitamos submit doble: el botón del footer llama a handleSaveStudent */}
        <Form>
          {/* Matrícula */}
          <FormGroup>
            <Label $required>
              Matrícula {selectedEstudiante && '(No editable)'}
            </Label>
            <Input
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleInputChange}
              disabled={isSubmitting || !!selectedEstudiante}
              placeholder="Ej: 2024001"
              $error={formErrors.matricula}
              autoComplete="off"
            />
            {formErrors.matricula && <ErrorText>{formErrors.matricula}</ErrorText>}
          </FormGroup>

          {/* Nombres y Apellidos */}
          <FormRow $columns="1fr 1fr">
            <FormGroup>
              <Label $required>Nombres</Label>
              <Input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Ej: Juan Carlos"
                $error={formErrors.nombres}
                autoComplete="off"
              />
              {formErrors.nombres && <ErrorText>{formErrors.nombres}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label $required>Apellidos</Label>
              <Input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Ej: Pérez López"
                $error={formErrors.apellidos}
                autoComplete="off"
              />
              {formErrors.apellidos && <ErrorText>{formErrors.apellidos}</ErrorText>}
            </FormGroup>
          </FormRow>

          {/* Email */}
          <FormGroup>
            <Label $required>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="estudiante@colegio.edu"
              $error={formErrors.email}
              autoComplete="off"
            />
            {formErrors.email && <ErrorText>{formErrors.email}</ErrorText>}
          </FormGroup>

          {/* Teléfono y Fecha de Nacimiento */}
          <FormRow $columns="1fr 1fr">
            <FormGroup>
              <Label>Teléfono</Label>
              <Input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="809-555-1234"
                $error={formErrors.telefono}
                autoComplete="off"
              />
              {formErrors.telefono && <ErrorText>{formErrors.telefono}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label $required>Fecha de Nacimiento</Label>
              <Input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                disabled={isSubmitting}
                $error={formErrors.fechaNacimiento}
              />
              {formErrors.fechaNacimiento && <ErrorText>{formErrors.fechaNacimiento}</ErrorText>}
            </FormGroup>
          </FormRow>

          {/* Dirección */}
          <FormGroup>
            <Label>Dirección</Label>
            <Input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="Dirección completa"
              autoComplete="off"
            />
          </FormGroup>

          {/* Fecha de Ingreso (solo al crear) */}
          {!selectedEstudiante && (
            <FormGroup>
              <Label>Fecha de Ingreso</Label>
              <Input
                type="date"
                name="fechaIngreso"
                value={formData.fechaIngreso}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </FormGroup>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
}
