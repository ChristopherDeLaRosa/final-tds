import { useState } from 'react';
import styled from 'styled-components';
import { Plus, X, Calendar, Users, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { MySwal, Toast } from '../../utils/alerts';
import { aulasConfig } from './aulasConfig';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #475569;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const GradosSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
`;

const GradoItem = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const GradoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const GradoLabel = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

const RemoveButton = styled.button`
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    background: #fcc;
  }
`;

const SeccionesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SeccionChip = styled.div`
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const AddSeccionInput = styled.div`
  display: flex;
  gap: 0.5rem;
  
  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    text-transform: uppercase;
  }
`;

const AddButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #059669;
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
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  position: sticky;
  bottom: 0;
  background: white;
`;

const InfoBox = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const CrearAulasMasivas = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    anio: new Date().getFullYear(),
    periodo: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    fechaInicio: '',
    fechaFin: '',
    capacidadMaximaPorDefecto: 35,
    grados: []
  });

  const [nuevoGrado, setNuevoGrado] = useState({
    grado: '',
    secciones: [],
    capacidadMaxima: null,
    aulaFisicaBase: ''
  });

  const [nuevaSeccion, setNuevaSeccion] = useState('');

  if (!isOpen) return null;

  const handleAgregarSeccion = () => {
    if (!nuevaSeccion.trim()) return;

    const seccionUpper = nuevaSeccion.toUpperCase();
    
    if (nuevoGrado.secciones.includes(seccionUpper)) {
      Toast.fire({
        icon: 'warning',
        title: 'Esta sección ya está agregada'
      });
      return;
    }

    setNuevoGrado({
      ...nuevoGrado,
      secciones: [...nuevoGrado.secciones, seccionUpper]
    });
    setNuevaSeccion('');
  };

  const handleRemoverSeccion = (seccion) => {
    setNuevoGrado({
      ...nuevoGrado,
      secciones: nuevoGrado.secciones.filter(s => s !== seccion)
    });
  };

  const handleAgregarGrado = () => {
    if (!nuevoGrado.grado || nuevoGrado.secciones.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'Selecciona un grado y agrega al menos una sección'
      });
      return;
    }

    // Verificar si el grado ya está agregado
    if (formData.grados.some(g => g.grado === parseInt(nuevoGrado.grado))) {
      Toast.fire({
        icon: 'warning',
        title: 'Este grado ya está agregado'
      });
      return;
    }

    setFormData({
      ...formData,
      grados: [...formData.grados, {
        grado: parseInt(nuevoGrado.grado),
        secciones: nuevoGrado.secciones,
        capacidadMaxima: nuevoGrado.capacidadMaxima ? parseInt(nuevoGrado.capacidadMaxima) : null,
        aulaFisicaBase: nuevoGrado.aulaFisicaBase || null
      }]
    });

    // Reset
    setNuevoGrado({
      grado: '',
      secciones: [],
      capacidadMaxima: null,
      aulaFisicaBase: ''
    });
    setNuevaSeccion('');
  };

  const handleRemoverGrado = (grado) => {
    setFormData({
      ...formData,
      grados: formData.grados.filter(g => g.grado !== grado)
    });
  };

  const handleSubmit = async () => {
    if (!formData.fechaInicio || !formData.fechaFin) {
      Toast.fire({
        icon: 'warning',
        title: 'Completa las fechas del periodo escolar'
      });
      return;
    }

    if (formData.grados.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'Agrega al menos un grado con secciones'
      });
      return;
    }

    const totalAulas = formData.grados.reduce((sum, g) => sum + g.secciones.length, 0);

    const { isConfirmed } = await MySwal.fire({
      title: '¿Crear aulas masivamente?',
      html: `
        <div style="text-align: left; margin-top: 1rem;">
          <p style="margin-bottom: 0.5rem;"><strong>Se crearán ${totalAulas} aulas:</strong></p>
          <ul style="margin-left: 1rem;">
            ${formData.grados.map(g => 
              `<li>${g.grado}° (${g.secciones.length} secciones: ${g.secciones.join(', ')})</li>`
            ).join('')}
          </ul>
          <p style="margin-top: 1rem; color: #64748b; font-size: 0.9rem;">
            Periodo: ${formData.periodo}<br>
            Fechas: ${formData.fechaInicio} al ${formData.fechaFin}
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear aulas',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    try {
      setLoading(true);

      MySwal.fire({
        title: 'Creando aulas...',
        html: 'Por favor espera',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false
      });

      const aulaService = (await import('../../services/aulaService')).default;
      const resultado = await aulaService.crearMasivas(formData);

      MySwal.close();

      if (resultado.exitoso) {
        await MySwal.fire({
          icon: 'success',
          title: '¡Aulas creadas!',
          html: `
            <div style="text-align: left;">
              <p>${resultado.aulasCreadas} aulas creadas exitosamente</p>
              ${resultado.aulasExistentes > 0 ? 
                `<p>${resultado.aulasExistentes} aulas ya existían</p>` : ''}
              ${resultado.errores.length > 0 ? 
                `<details style="margin-top: 1rem;">
                  <summary style="cursor: pointer; color: #f59e0b;">
                    Ver advertencias (${resultado.errores.length})
                  </summary>
                  <ul style="margin-top: 0.5rem; margin-left: 1rem; font-size: 0.9rem;">
                    ${resultado.errores.map(e => `<li>${e}</li>`).join('')}
                  </ul>
                </details>` : ''}
            </div>
          `
        });

        onSuccess();
        onClose();
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error al crear aulas',
          text: resultado.mensaje
        });
      }
    } catch (error) {
      MySwal.close();
      console.error('Error:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudieron crear las aulas'
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradoLabel = (gradoValue) => {
    return aulasConfig.grados.find(g => g.value === gradoValue)?.label || gradoValue;
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Zap size={24} />
            Crear Aulas Masivamente
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <InfoBox>
            <AlertCircle size={20} />
            <div>
              Crea todas las aulas de un año escolar de una sola vez. Define los grados, secciones 
              y el periodo académico.
            </div>
          </InfoBox>

          {/* Información General */}
          <FormSection>
            <SectionTitle>
              <Calendar size={18} />
              Información del Periodo
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Año Escolar *</Label>
                <Input
                  type="number"
                  value={formData.anio}
                  onChange={(e) => setFormData({
                    ...formData,
                    anio: parseInt(e.target.value),
                    periodo: `${e.target.value}-${parseInt(e.target.value) + 1}`
                  })}
                  min="2020"
                  max="2030"
                />
              </FormGroup>

              <FormGroup>
                <Label>Periodo *</Label>
                <Input
                  type="text"
                  value={formData.periodo}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  placeholder="2024-2025"
                />
              </FormGroup>

              <FormGroup>
                <Label>Fecha Inicio *</Label>
                <Input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Fecha Fin *</Label>
                <Input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Capacidad por Defecto *</Label>
                <Input
                  type="number"
                  value={formData.capacidadMaximaPorDefecto}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    capacidadMaximaPorDefecto: parseInt(e.target.value) 
                  })}
                  min="1"
                  max="50"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Agregar Grados */}
          <FormSection>
            <SectionTitle>
              <Users size={18} />
              Agregar Grado
            </SectionTitle>
            <GradosSection>
              <FormGrid>
                <FormGroup>
                  <Label>Grado *</Label>
                  <select
                    value={nuevoGrado.grado}
                    onChange={(e) => setNuevoGrado({ ...nuevoGrado, grado: e.target.value })}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {aulasConfig.grados.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <Label>Capacidad Específica</Label>
                  <Input
                    type="number"
                    value={nuevoGrado.capacidadMaxima || ''}
                    onChange={(e) => setNuevoGrado({ 
                      ...nuevoGrado, 
                      capacidadMaxima: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="Dejar vacío - Por defecto"
                    min="1"
                    max="50"
                  />
                </FormGroup>

                <FormGroup style={{ gridColumn: '1 / -1' }}>
                  <Label>Ubicación Base (Opcional)</Label>
                  <Input
                    type="text"
                    value={nuevoGrado.aulaFisicaBase}
                    onChange={(e) => setNuevoGrado({ ...nuevoGrado, aulaFisicaBase: e.target.value })}
                    placeholder="Ej: Edificio A, Primer Piso"
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label>Secciones *</Label>
                {nuevoGrado.secciones.length > 0 && (
                  <SeccionesContainer>
                    {nuevoGrado.secciones.map(seccion => (
                      <SeccionChip key={seccion}>
                        {seccion}
                        <button onClick={() => handleRemoverSeccion(seccion)}>
                          <X size={14} />
                        </button>
                      </SeccionChip>
                    ))}
                  </SeccionesContainer>
                )}
                <AddSeccionInput>
                  <input
                    type="text"
                    value={nuevaSeccion}
                    onChange={(e) => setNuevaSeccion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAgregarSeccion()}
                    placeholder="Escribir sección (Ej: A, B, C)"
                    maxLength="3"
                  />
                  <AddButton type="button" onClick={handleAgregarSeccion}>
                    <Plus size={18} />
                    Agregar
                  </AddButton>
                </AddSeccionInput>
              </FormGroup>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <ButtonPrimary onClick={handleAgregarGrado}>
                  <Plus size={18} />
                  Agregar Grado
                </ButtonPrimary>
              </div>
            </GradosSection>
          </FormSection>

          {/* Grados Agregados */}
          {formData.grados.length > 0 && (
            <FormSection>
              <SectionTitle>
                <CheckCircle size={18} />
                Grados Configurados ({formData.grados.length})
              </SectionTitle>
              {formData.grados.map(grado => (
                <GradoItem key={grado.grado}>
                  <GradoHeader>
                    <GradoLabel>{getGradoLabel(grado.grado)}</GradoLabel>
                    <RemoveButton onClick={() => handleRemoverGrado(grado.grado)}>
                      <X size={16} />
                      Quitar
                    </RemoveButton>
                  </GradoHeader>
                  <SeccionesContainer>
                    {grado.secciones.map(seccion => (
                      <SeccionChip key={seccion}>{seccion}</SeccionChip>
                    ))}
                  </SeccionesContainer>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Capacidad: {grado.capacidadMaxima || formData.capacidadMaximaPorDefecto} estudiantes
                    {grado.aulaFisicaBase && ` • ${grado.aulaFisicaBase}`}
                  </div>
                </GradoItem>
              ))}
            </FormSection>
          )}
        </ModalBody>

        <ModalFooter>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Total de aulas a crear: <strong>
              {formData.grados.reduce((sum, g) => sum + g.secciones.length, 0)}
            </strong>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <ButtonSecondary onClick={onClose} disabled={loading}>
              Cancelar
            </ButtonSecondary>
            <ButtonPrimary onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creando...' : (
                <>
                  <Zap size={18} />
                  Crear Aulas
                </>
              )}
            </ButtonPrimary>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CrearAulasMasivas;

