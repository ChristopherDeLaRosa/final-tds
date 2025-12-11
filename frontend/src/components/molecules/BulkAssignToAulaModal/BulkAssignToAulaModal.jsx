import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles';
import { Users, Check, X } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${theme.spacing.lg};
`;

const ModalContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${theme.shadows.xl};
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${theme.fontSize.xl};
  color: ${theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.xl};
  overflow-y: auto;
  flex: 1;
`;

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.backgroundAlt};
  border-radius: ${theme.borderRadius.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  color: ${theme.colors.text};
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.text};
  background: ${theme.colors.white};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &:disabled {
    background: ${theme.colors.backgroundAlt};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const InfoBox = styled.div`
  padding: ${theme.spacing.lg};
  background: ${props => props.$variant === 'warning' 
    ? 'rgba(245, 158, 11, 0.1)' 
    : 'rgba(59, 130, 246, 0.1)'};
  border: 1px solid ${props => props.$variant === 'warning' 
    ? 'rgba(245, 158, 11, 0.3)' 
    : 'rgba(59, 130, 246, 0.3)'};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  
  strong {
    font-weight: 600;
  }
`;

const StudentsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.sm};
  max-height: 400px;
  overflow-y: auto;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
`;

const StudentCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  background: ${props => props.$selected 
    ? 'rgba(37, 99, 235, 0.1)' 
    : theme.colors.white};
  border: 1px solid ${props => props.$selected 
    ? theme.colors.accent 
    : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$selected 
      ? 'rgba(37, 99, 235, 0.15)' 
      : theme.colors.backgroundAlt};
    border-color: ${theme.colors.accent};
  }
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex: 1;
`;

const StudentName = styled.div`
  font-weight: 600;
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
`;

const StudentDetails = styled.div`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textMuted};
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$checked 
    ? theme.colors.accent 
    : theme.colors.white};
  border: 2px solid ${props => props.$checked 
    ? theme.colors.accent 
    : theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  transition: all 0.2s ease;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxxl} ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.xl};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const SelectionInfo = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textMuted};
  
  strong {
    color: ${theme.colors.text};
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const Button = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  ${props => props.$variant === 'primary' && `
    background: ${theme.colors.accent};
    color: ${theme.colors.white};
    
    &:hover:not(:disabled) {
      background: ${theme.colors.accentHover};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
  `}
  
  ${props => props.$variant === 'secondary' && `
    background: ${theme.colors.white};
    color: ${theme.colors.textSecondary};
    border: 1px solid ${theme.colors.border};
    
    &:hover:not(:disabled) {
      background: ${theme.colors.backgroundAlt};
      border-color: ${theme.colors.borderDark};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export default function BulkAssignToAulaModal({ 
  isOpen, 
  onClose, 
  aulas = [],
  onAssign 
}) {
  const [selectedGrado, setSelectedGrado] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');
  const [selectedAula, setSelectedAula] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Obtener grados únicos de las aulas
  const gradosDisponibles = [...new Set(aulas.map(a => a.grado))]
    .filter(Boolean)
    .sort((a, b) => a - b);

  // Obtener secciones disponibles para el grado seleccionado
  const seccionesDisponibles = selectedGrado
    ? [...new Set(aulas
        .filter(a => a.grado === parseInt(selectedGrado))
        .map(a => a.seccion))]
        .filter(Boolean)
        .sort()
    : [];

  // Obtener aulas compatibles
  const aulasCompatibles = aulas.filter(a => 
    a.grado === parseInt(selectedGrado) &&
    a.seccion === selectedSeccion &&
    a.activo
  );

  // Resetear cuando cambia el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedGrado('');
      setSelectedSeccion('');
      setSelectedAula('');
      setStudents([]);
      setSelectedStudents(new Set());
    }
  }, [isOpen]);

  // Cargar estudiantes cuando se selecciona grado y sección
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedGrado || !selectedSeccion) {
        setStudents([]);
        return;
      }

      setLoading(true);
      try {
        // Aquí llamamos al servicio que debes importar
        const { default: estudianteService } = await import('../../../services/estudianteService');
        const data = await estudianteService.getByGradoSeccion(
          parseInt(selectedGrado),
          selectedSeccion
        );
        
        // Filtrar solo estudiantes activos y sin aula asignada
        const estudiantesSinAula = data.filter(e => e.activo && !e.aulaId);
        setStudents(estudiantesSinAula);
        
        // Seleccionar todos por defecto
        setSelectedStudents(new Set(estudiantesSinAula.map(e => e.id)));
      } catch (error) {
        console.error('Error cargando estudiantes:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [selectedGrado, selectedSeccion]);

  const handleToggleStudent = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)));
    }
  };

  const handleAssign = async () => {
    if (!selectedAula || selectedStudents.size === 0) return;

    setIsAssigning(true);
    try {
      await onAssign(selectedAula, Array.from(selectedStudents));
      onClose();
    } catch (error) {
      console.error('Error asignando estudiantes:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  const aulaSeleccionada = aulas.find(a => a.id === parseInt(selectedAula));
  const cuposDisponibles = aulaSeleccionada 
    ? aulaSeleccionada.cuposDisponibles 
    : 0;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <Title>
            <Users size={24} />
            Asignación Masiva a Aula
          </Title>
        </ModalHeader>

        <ModalBody>
          <FilterSection>
            <FormGroup>
              <Label>Grado</Label>
              <Select
                value={selectedGrado}
                onChange={(e) => {
                  setSelectedGrado(e.target.value);
                  setSelectedSeccion('');
                  setSelectedAula('');
                }}
              >
                <option value="">Selecciona un grado</option>
                {gradosDisponibles.map(grado => (
                  <option key={grado} value={grado}>{grado}°</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Sección</Label>
              <Select
                value={selectedSeccion}
                onChange={(e) => {
                  setSelectedSeccion(e.target.value);
                  setSelectedAula('');
                }}
                disabled={!selectedGrado}
              >
                <option value="">Selecciona una sección</option>
                {seccionesDisponibles.map(seccion => (
                  <option key={seccion} value={seccion}>{seccion}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Aula Destino</Label>
              <Select
                value={selectedAula}
                onChange={(e) => setSelectedAula(e.target.value)}
                disabled={!selectedSeccion}
              >
                <option value="">Selecciona un aula</option>
                {aulasCompatibles.map(aula => (
                  <option key={aula.id} value={aula.id}>
                    {aula.periodo} ({aula.anio}) - {aula.cuposDisponibles} cupos
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FilterSection>

          {selectedAula && cuposDisponibles < selectedStudents.size && (
            <InfoBox $variant="warning">
              <strong>Advertencia:</strong> Has seleccionado {selectedStudents.size} estudiantes 
              pero el aula solo tiene {cuposDisponibles} cupos disponibles.
            </InfoBox>
          )}

          {selectedGrado && selectedSeccion && !loading && (
            <>
              {students.length > 0 ? (
                <>
                  <InfoBox>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        Se encontraron <strong>{students.length}</strong> estudiantes 
                        sin aula asignada en {selectedGrado}° {selectedSeccion}
                      </span>
                      <Button
                        $variant="secondary"
                        onClick={handleSelectAll}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {selectedStudents.size === students.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                      </Button>
                    </div>
                  </InfoBox>

                  <StudentsGrid>
                    {students.map(student => (
                      <StudentCard
                        key={student.id}
                        $selected={selectedStudents.has(student.id)}
                        onClick={() => handleToggleStudent(student.id)}
                      >
                        <StudentInfo>
                          <CheckIcon $checked={selectedStudents.has(student.id)}>
                            {selectedStudents.has(student.id) && <Check size={14} />}
                          </CheckIcon>
                          <div>
                            <StudentName>{student.nombreCompleto}</StudentName>
                            <StudentDetails>
                              {student.matricula} • {student.email}
                            </StudentDetails>
                          </div>
                        </StudentInfo>
                      </StudentCard>
                    ))}
                  </StudentsGrid>
                </>
              ) : (
                <EmptyState>
                  No hay estudiantes sin aula en {selectedGrado}° {selectedSeccion}
                </EmptyState>
              )}
            </>
          )}

          {loading && (
            <EmptyState>Cargando estudiantes...</EmptyState>
          )}
        </ModalBody>

        <ModalFooter>
          <SelectionInfo>
            {selectedStudents.size > 0 && (
              <>
                <strong>{selectedStudents.size}</strong> estudiante(s) seleccionado(s)
              </>
            )}
          </SelectionInfo>

          <ButtonGroup>
            <Button
              $variant="secondary"
              onClick={onClose}
              disabled={isAssigning}
            >
              <X size={18} />
              Cancelar
            </Button>
            <Button
              $variant="primary"
              onClick={handleAssign}
              disabled={!selectedAula || selectedStudents.size === 0 || isAssigning}
            >
              <Check size={18} />
              {isAssigning ? 'Asignando...' : `Asignar ${selectedStudents.size} estudiante(s)`}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
