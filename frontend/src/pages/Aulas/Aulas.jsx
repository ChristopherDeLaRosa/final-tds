import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, Settings, Trash2, Edit, Users, Calendar, Zap } from 'lucide-react';
import aulaService from '../../services/aulaService';
import { aulasConfig } from './aulasConfig';
import CrearAulasMasivas from './CrearAulasMasivas';
import { Toast, MySwal } from '../../utils/alerts'; //  <--- IMPORTANTE

const Aulas = () => {
  const navigate = useNavigate();
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAula, setEditingAula] = useState(null);
  const [showMasivaModal, setShowMasivaModal] = useState(false);
  const [formData, setFormData] = useState({
    grado: '',
    seccion: '',
    anio: new Date().getFullYear(),
    periodo: '',
    capacidadMaxima: '',
    aulaFisica: '',
    fechaInicio: '',
    fechaFin: '',
    activo: true
  });

  useEffect(() => {
    loadAulas();
  }, []);

  const loadAulas = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await aulaService.getAll();
      setAulas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar aulas:', err);

      MySwal.fire({
        icon: 'error',
        title: 'Error al cargar aulas',
        text: err.response?.data?.message || 'No se pudieron cargar las aulas.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ================================
  //  GUARDAR / EDITAR AULA
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const dataToSend = {
        grado: parseInt(formData.grado),
        seccion: formData.seccion,
        anio: parseInt(formData.anio),
        periodo: formData.periodo,
        capacidadMaxima: parseInt(formData.capacidadMaxima),
        aulaFisica: formData.aulaFisica,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        activo: formData.activo !== false
      };

      MySwal.fire({
        title: editingAula ? 'Actualizando aula...' : 'Creando aula...',
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading()
      });

      if (editingAula) {
        await aulaService.update(editingAula.id, dataToSend);
      } else {
        await aulaService.create(dataToSend);
      }

      MySwal.close();

      Toast.fire({
        icon: 'success',
        title: editingAula ? 'Aula actualizada' : 'Aula creada'
      });

      // Reset form
      setFormData({
        grado: '',
        seccion: '',
        anio: new Date().getFullYear(),
        periodo: '',
        capacidadMaxima: '',
        aulaFisica: '',
        fechaInicio: '',
        fechaFin: '',
        activo: true
      });

      setShowForm(false);
      setEditingAula(null);
      await loadAulas();

    } catch (err) {
      console.error('Error al guardar aula:', err);

      MySwal.fire({
        icon: 'error',
        title: 'Error al guardar aula',
        text: err.response?.data?.message || 'Ocurrió un error'
      });

    } finally {
      setLoading(false);
    }
  };

  // ================================
  //  EDITAR AULA
  // ================================
  const handleEdit = (aula) => {
    setEditingAula(aula);
    setFormData({
      grado: aula.grado.toString(),
      seccion: aula.seccion,
      anio: aula.anio.toString(),
      periodo: aula.periodo,
      capacidadMaxima: aula.capacidadMaxima.toString(),
      aulaFisica: aula.aulaFisica || '',
      fechaInicio: aula.fechaInicio?.split('T')[0] || '',
      fechaFin: aula.fechaFin?.split('T')[0] || '',
      activo: aula.activo !== false
    });
    setShowForm(true);
  };

  // ================================
  //  ELIMINAR AULA (SweetAlert)
  // ================================
  const handleDelete = async (id) => {
    const { isConfirmed } = await MySwal.fire({
      title: '¿Eliminar aula?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    try {
      setLoading(true);

      MySwal.fire({
        title: 'Eliminando...',
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading()
      });

      await aulaService.delete(id);
      await loadAulas();

      MySwal.close();

      Toast.fire({
        icon: 'success',
        title: 'Aula eliminada correctamente'
      });

    } catch (err) {
      console.error('Error al eliminar aula:', err);

      MySwal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: err.response?.data?.message || 'No se pudo eliminar.'
      });

    } finally {
      setLoading(false);
    }
  };

  const handleConfigurar = (aulaId) => {
    if (!aulaId) {
      setError('ID de aula no válido');
      return;
    }
    navigate(`/aulas/${aulaId}/configurar`);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingAula(null);
    setFormData({
      grado: '',
      seccion: '',
      anio: new Date().getFullYear(),
      periodo: '',
      capacidadMaxima: '',
      aulaFisica: '',
      fechaInicio: '',
      fechaFin: '',
      activo: true
    });
  };

  if (loading && !showForm) {
    return (
      <Container>
        <LoadingMessage>Cargando aulas...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gestión de Aulas</Title>

        {!showForm && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <ButtonPrimary 
              onClick={() => setShowMasivaModal(true)}
              style={{ background: '#10b981' }}
            >
              <Zap size={20} />
              Crear Aulas
            </ButtonPrimary>
          </div>
        )}
      </Header>

      {showForm ? (
        <FormCard>
          <FormTitle>
            {editingAula ? 'Editar Aula' : 'Nueva Aula'}
          </FormTitle>

          <Form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <Label>Grado *</Label>
                <Select
                  name="grado"
                  value={formData.grado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {aulasConfig.grados.map(g => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Sección *</Label>
                <Input
                  type="text"
                  name="seccion"
                  value={formData.seccion}
                  onChange={handleInputChange}
                  placeholder="Ej: A, B, C"
                  maxLength={10}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Año *</Label>
                <Input
                  type="number"
                  name="anio"
                  value={formData.anio}
                  onChange={handleInputChange}
                  min="2020"
                  max="2030"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Periodo *</Label>
                <Input
                  type="text"
                  name="periodo"
                  value={formData.periodo}
                  onChange={handleInputChange}
                  placeholder="Ej: 2024-2025"
                  maxLength={20}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Capacidad Máxima *</Label>
                <Input
                  type="number"
                  name="capacidadMaxima"
                  value={formData.capacidadMaxima}
                  onChange={handleInputChange}
                  placeholder="Ej: 30"
                  min="1"
                  max="100"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Aula Física</Label>
                <Input
                  type="text"
                  name="aulaFisica"
                  value={formData.aulaFisica}
                  onChange={handleInputChange}
                  placeholder="Ej: Edificio A, Sala 101"
                />
              </FormGroup>

              <FormGroup>
                <Label>Fecha Inicio *</Label>
                <Input
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Fecha Fin *</Label>
                <Input
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </FormGrid>

            <FormActions>
              <ButtonSecondary type="button" onClick={cancelForm}>
                Cancelar
              </ButtonSecondary>

              <ButtonPrimary type="submit" disabled={loading}>
                {loading ? 'Guardando...' : editingAula ? 'Actualizar' : 'Crear'}
              </ButtonPrimary>
            </FormActions>
          </Form>
        </FormCard>
      ) : (
        <AulasGrid>
          {aulas.length === 0 ? (
            <EmptyState>
              <p>No hay aulas registradas</p>
              <p>Haga clic en "Crear Aulas" para comenzar</p>
            </EmptyState>
          ) : (
            aulas.map(aula => (
              <AulaCard key={aula.id}>
                <CardHeader>
                  <CardTitle>{aula.grado}° {aula.seccion}</CardTitle>
                  <CardPeriodo>{aula.periodo} ({aula.anio})</CardPeriodo>
                </CardHeader>

                <CardBody>
                  {aula.aulaFisica && (
                    <InfoRow>
                      <InfoLabel>Ubicación:</InfoLabel>
                      <InfoValue>{aula.aulaFisica}</InfoValue>
                    </InfoRow>
                  )}

                  <InfoRow>
                    <InfoLabel><Users size={16}/> Estudiantes:</InfoLabel>
                    <InfoValue>{aula.cantidadEstudiantes || 0} / {aula.capacidadMaxima}</InfoValue>
                  </InfoRow>

                  <InfoRow>
                    <InfoLabel><Calendar size={16}/> Periodo:</InfoLabel>
                    <InfoValue>
                      {new Date(aula.fechaInicio).toLocaleDateString()} – {new Date(aula.fechaFin).toLocaleDateString()}
                    </InfoValue>
                  </InfoRow>
                </CardBody>

                <CardActions>
                  <ActionButton 
                    $color="#4CAF50"
                    onClick={() => handleConfigurar(aula.id)}
                  >
                    <Settings size={18}/>
                    Configurar
                  </ActionButton>

                  <ActionButton 
                    $color="#2196F3"
                    onClick={() => handleEdit(aula)}
                  >
                    <Edit size={18}/>
                  </ActionButton>

                  <ActionButton 
                    $color="#f44336"
                    onClick={() => handleDelete(aula.id)}
                  >
                    <Trash2 size={18}/>
                  </ActionButton>
                </CardActions>
              </AulaCard>
            ))
          )}
        </AulasGrid>
      )}

      <CrearAulasMasivas
        isOpen={showMasivaModal}
        onClose={() => setShowMasivaModal(false)}
        onSuccess={() => {
          loadAulas();
          Toast.fire({
            icon: 'success',
            title: 'Aulas creadas exitosamente'
          });
        }}
      />
    </Container>
  );
};

// ==================== STYLED COMPONENTS ====================
/* (Todo el bloque de styled-components permanece igual) */

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
`;

const ButtonPrimary = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonSecondary = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 1.1rem;
`;

const AulasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;

  p:first-child {
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
`;

const AulaCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const CardPeriodo = styled.div`
  color: #64748b;
  font-size: 0.9rem;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
`;

const InfoLabel = styled.span`
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoValue = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${(p) => p.$color || '#3b82f6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

export default Aulas;
