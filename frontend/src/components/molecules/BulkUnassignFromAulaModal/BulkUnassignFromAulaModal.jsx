import { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../../styles";
import { UserMinus, Check, X } from "lucide-react";

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
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
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
  background: ${(props) =>
    props.$selected ? theme.colors.dangerLight : theme.colors.white};
  border: 1px solid
    ${(props) =>
      props.$selected ? theme.colors.danger : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transition.normal};

  &:hover {
    background: ${(props) =>
      props.$selected ? theme.colors.dangerLight : theme.colors.backgroundAlt};
    border-color: ${theme.colors.danger};
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

const AulaBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.1);
  color: ${theme.colors.accent};
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.xs};
  font-weight: 600;
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) =>
    props.$checked ? theme.colors.danger : theme.colors.white};
  border: 2px solid
    ${(props) =>
      props.$checked ? theme.colors.danger : theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  transition: ${theme.transition.normal};
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
  background: ${theme.colors.backgroundAlt};  
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
  font-weight: ${theme.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transition.normal};
  border: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};


  ${(props) =>
    props.$variant === "danger" &&
    `
      background: ${theme.colors.danger};
      color: ${theme.colors.white};
      box-shadow: ${theme.shadows.md};

      &:hover:not(:disabled) {
        background: #dc2626;
        transform: translateY(-1px);
        box-shadow: ${theme.shadows.lg};
      }
    `}

  ${(props) =>
    props.$variant === "secondary" &&
    `
      background: ${theme.colors.white};
      color: ${theme.colors.textSecondary};
      border: 1px solid ${theme.colors.border};

      &:hover:not(:disabled) {
        background: ${theme.colors.backgroundAlt};
        border-color: ${theme.colors.borderDark};
      }
    `}

  &:disabled {
    cursor: not-allowed;
    transform: none;
    opacity: 1;

    ${props =>
      props.$variant === "danger" &&
      `
        background: ${theme.colors.dangerLight};
        color: ${theme.colors.danger};
        box-shadow: none;
      `}
  }
`;


export default function BulkUnassignFromAulaModal({
  isOpen,
  onClose,
  aulas = [],
  onUnassign,
}) {
  const [selectedAula, setSelectedAula] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);

  // Resetear cuando cambia el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedAula("");
      setStudents([]);
      setSelectedStudents(new Set());
    }
  }, [isOpen]);

  // Cargar estudiantes cuando se selecciona un aula

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedAula) {
        setStudents([]);
        return;
      }

      setLoading(true);
      try {
        const { default: estudianteService } = await import(
          "../../../services/estudianteService"
        );
        const allStudents = await estudianteService.getAll();

        const aulaIdNumber = parseInt(selectedAula);

        // Filtrar estudiantes asignados al aula seleccionada
        const estudiantesDelAula = allStudents.filter(
          (e) => e.activo && e.aulaId == aulaIdNumber
        );

        console.log(
          `Aula ${aulaIdNumber}: ${estudiantesDelAula.length} estudiantes encontrados`
        );

        setStudents(estudiantesDelAula);
        setSelectedStudents(new Set()); // No seleccionar ninguno por defecto
      } catch (error) {
        console.error("Error cargando estudiantes:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [selectedAula]);
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
      setSelectedStudents(new Set(students.map((s) => s.id)));
    }
  };

  const handleUnassign = async () => {
    if (selectedStudents.size === 0) return;

    setIsUnassigning(true);
    try {
      await onUnassign(Array.from(selectedStudents));
      onClose();
    } catch (error) {
      console.error("Error desasignando estudiantes:", error);
    } finally {
      setIsUnassigning(false);
    }
  };

  if (!isOpen) return null;

  const aulaSeleccionada = aulas.find((a) => a.id === parseInt(selectedAula));

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <Title>
            <UserMinus size={24} />
            Desasignar Estudiantes de Aula
          </Title>
        </ModalHeader>

        <ModalBody>
          <FilterSection>
            <FormGroup>
              <Label>Selecciona el Aula</Label>
              <Select
                value={selectedAula}
                onChange={(e) => setSelectedAula(e.target.value)}
              >
                <option value="">Selecciona un aula</option>
                {aulas
                  .filter((a) => a.activo)
                  .map((aula) => {
                    // Contar estudiantes manualmente si no existe cantidadEstudiantes
                    const label = `${aula.grado}° ${aula.seccion} - ${aula.periodo} (${aula.anio})`;
                    return (
                      <option key={aula.id} value={aula.id}>
                        {label}
                      </option>
                    );
                  })}
              </Select>
            </FormGroup>
          </FilterSection>

          {selectedAula && students.length > 0 && (
            <InfoBox>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <strong>{students.length}</strong> estudiantes asignados a{" "}
                  {aulaSeleccionada?.grado}° {aulaSeleccionada?.seccion}
                </span>
                <Button
                  $variant="secondary"
                  onClick={handleSelectAll}
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  {selectedStudents.size === students.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </Button>
              </div>
            </InfoBox>
          )}

          {selectedAula && !loading && (
            <>
              {students.length > 0 ? (
                <StudentsGrid>
                  {students.map((student) => (
                    <StudentCard
                      key={student.id}
                      $selected={selectedStudents.has(student.id)}
                      onClick={() => handleToggleStudent(student.id)}
                    >
                      <StudentInfo>
                        <CheckIcon $checked={selectedStudents.has(student.id)}>
                          {selectedStudents.has(student.id) && (
                            <Check size={14} />
                          )}
                        </CheckIcon>
                        <div style={{ flex: 1 }}>
                          <StudentName>{student.nombreCompleto}</StudentName>
                          <StudentDetails>
                            {student.matricula} • {student.email}
                          </StudentDetails>
                        </div>
                        <AulaBadge>{aulaSeleccionada?.periodo}</AulaBadge>
                      </StudentInfo>
                    </StudentCard>
                  ))}
                </StudentsGrid>
              ) : (
                <EmptyState>
                  No hay estudiantes asignados a esta aula
                </EmptyState>
              )}
            </>
          )}

          {loading && <EmptyState>Cargando estudiantes...</EmptyState>}

          {!selectedAula && !loading && (
            <EmptyState>Selecciona un aula para ver sus estudiantes</EmptyState>
          )}
        </ModalBody>

        <ModalFooter>
          <SelectionInfo>
            {selectedStudents.size > 0 && (
              <>
                <strong>{selectedStudents.size}</strong> estudiante(s)
                seleccionado(s) para desasignar
              </>
            )}
          </SelectionInfo>

          <ButtonGroup>
            <Button
              $variant="secondary"
              onClick={onClose}
              disabled={isUnassigning}
            >
              <X size={18} />
              Cancelar
            </Button>
            <Button
              $variant="danger"
              onClick={handleUnassign}
              disabled={selectedStudents.size === 0 || isUnassigning}
            >
              <UserMinus size={18} />
              {isUnassigning
                ? "Desasignando..."
                : `Desasignar ${selectedStudents.size} estudiante(s)`}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
