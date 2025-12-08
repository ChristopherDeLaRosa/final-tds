import { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles';

const TableContainer = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 500px);
  min-height: 400px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.backgroundAlt};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.md};
    
    &:hover {
      background: ${theme.colors.borderDark};
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
`;

const Thead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${theme.colors.backgroundAlt};
`;

const Th = styled.th`
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  text-align: ${props => props.$align || 'left'};
  font-size: ${theme.fontSize.xs};
  font-weight: 700;
  color: ${theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid ${theme.colors.border};
  white-space: nowrap;
  background: ${theme.colors.backgroundAlt};
  
  ${props => props.$sticky && `
    position: sticky;
    left: 0;
    z-index: 11;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  `}
  
  ${props => props.$rubroHeader && `
    min-width: 120px;
    text-align: center;
  `}
`;

const RubroHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  align-items: center;
`;

const RubroName = styled.div`
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  color: ${theme.colors.text};
`;

const RubroPercentage = styled.div`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textMuted};
  font-weight: 500;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  transition: background-color 0.15s ease;
  
  &:hover {
    background: ${theme.colors.backgroundAlt};
  }
  
  &:nth-child(even) {
    background: ${theme.colors.background};
    
    &:hover {
      background: ${theme.colors.backgroundAlt};
    }
  }
`;

const Td = styled.td`
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.borderLight};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.text};
  
  ${props => props.$sticky && `
    position: sticky;
    left: 0;
    background: inherit;
    z-index: 5;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.03);
  `}
  
  ${props => props.$align && `
    text-align: ${props.$align};
  `}
`;

const StudentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 200px;
`;

const StudentName = styled.div`
  font-weight: 600;
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
`;

const StudentMatricula = styled.div`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textMuted};
`;

const GradeInput = styled.input`
  width: 100%;
  max-width: 90px;
  padding: ${theme.spacing.sm};
  border: 2px solid ${props => {
    if (props.$isModified) return theme.colors.warning;
    if (props.$hasError) return theme.colors.danger;
    return theme.colors.border;
  }};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  text-align: center;
  color: ${theme.colors.text};
  background: ${props => props.$isModified ? `${theme.colors.warning}08` : theme.colors.white};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? theme.colors.danger : theme.colors.accent};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? `${theme.colors.danger}20` : `${theme.colors.accent}20`};
  }
  
  &:hover:not(:focus) {
    border-color: ${props => props.$hasError ? theme.colors.danger : theme.colors.borderDark};
  }
  
  /* Ocultar flechas de input number */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    appearance: textfield;
  }
`;

const PromedioCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-weight: 700;
  font-size: ${theme.fontSize.md};
  color: ${props => {
    if (props.$value === null) return theme.colors.textMuted;
    if (props.$value >= 70) return theme.colors.success;
    if (props.$value >= 60) return theme.colors.warning;
    return theme.colors.danger;
  }};
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.md};
`;

export default function GradebookTable({ data, onCellChange, modifiedCells = {} }) {
  const [focusedCell, setFocusedCell] = useState(null);
  const inputRefs = useRef({});

  if (!data || !data.estudiantes || data.estudiantes.length === 0) {
    return (
      <TableContainer>
        <EmptyMessage>
          No hay estudiantes inscritos en este grupo-curso
        </EmptyMessage>
      </TableContainer>
    );
  }

  const handleInputChange = (estudianteId, rubroId, value) => {
    // Validar que sea un número válido o vacío
    if (value !== '' && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
      return;
    }
    
    onCellChange(estudianteId, rubroId, value);
  };

  const handleKeyDown = (e, estudianteIndex, rubroIndex) => {
    const totalEstudiantes = data.estudiantes.length;
    const totalRubros = data.rubros.length;

    let newEstudianteIndex = estudianteIndex;
    let newRubroIndex = rubroIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newEstudianteIndex = Math.min(estudianteIndex + 1, totalEstudiantes - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newEstudianteIndex = Math.max(estudianteIndex - 1, 0);
        break;
      case 'ArrowRight':
      case 'Tab':
        if (!e.shiftKey) {
          e.preventDefault();
          newRubroIndex = rubroIndex + 1;
          if (newRubroIndex >= totalRubros) {
            newRubroIndex = 0;
            newEstudianteIndex = Math.min(estudianteIndex + 1, totalEstudiantes - 1);
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newRubroIndex = Math.max(rubroIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        newEstudianteIndex = estudianteIndex + 1;
        if (newEstudianteIndex >= totalEstudiantes) {
          newEstudianteIndex = 0;
        }
        break;
      default:
        return;
    }

    // Focus en la nueva celda
    const estudiante = data.estudiantes[newEstudianteIndex];
    const rubro = data.rubros[newRubroIndex];
    const cellKey = `${estudiante.estudianteId}-${rubro.rubroId}`;
    
    const inputElement = inputRefs.current[cellKey];
    if (inputElement) {
      inputElement.focus();
      inputElement.select();
    }
  };

  return (
    <TableContainer>
      <TableWrapper>
        <Table>
          <Thead>
            <tr>
              {/* Columna de estudiante */}
              <Th $sticky>Estudiante</Th>
              
              {/* Columnas de rubros */}
              {data.rubros.map(rubro => (
                <Th key={rubro.rubroId} $rubroHeader>
                  <RubroHeader>
                    <RubroName>{rubro.nombreRubro}</RubroName>
                    <RubroPercentage>{rubro.porcentaje}%</RubroPercentage>
                  </RubroHeader>
                </Th>
              ))}
              
              {/* Columna de promedio */}
              <Th $align="center">Promedio</Th>
            </tr>
          </Thead>
          
          <Tbody>
            {data.estudiantes.map((estudiante, estudianteIndex) => (
              <Tr key={estudiante.estudianteId}>
                {/* Columna de estudiante */}
                <Td $sticky>
                  <StudentInfo>
                    <StudentName>{estudiante.nombreCompleto}</StudentName>
                    <StudentMatricula>{estudiante.matricula}</StudentMatricula>
                  </StudentInfo>
                </Td>
                
                {/* Columnas de notas */}
                {data.rubros.map((rubro, rubroIndex) => {
                  const cellKey = `${estudiante.estudianteId}-${rubro.rubroId}`;
                  const nota = estudiante.notasPorRubro[rubro.rubroId];
                  const isModified = cellKey in modifiedCells;
                  
                  return (
                    <Td key={rubro.rubroId} $align="center">
                      <GradeInput
                        ref={el => inputRefs.current[cellKey] = el}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={nota !== null && nota !== undefined ? nota : ''}
                        onChange={(e) => handleInputChange(
                          estudiante.estudianteId,
                          rubro.rubroId,
                          e.target.value
                        )}
                        onKeyDown={(e) => handleKeyDown(e, estudianteIndex, rubroIndex)}
                        onFocus={() => setFocusedCell(cellKey)}
                        onBlur={() => setFocusedCell(null)}
                        placeholder="--"
                        $isModified={isModified}
                      />
                    </Td>
                  );
                })}
                
                {/* Columna de promedio */}
                <Td $align="center">
                  <PromedioCell $value={estudiante.promedioFinal}>
                    {estudiante.promedioFinal !== null && estudiante.promedioFinal !== undefined ? (
                      <>
                        {estudiante.promedioFinal.toFixed(2)}
                        <StatusIcon>
                          {estudiante.promedioFinal >= 70 ? (
                            <CheckCircle size={16} />
                          ) : (
                            <AlertCircle size={16} />
                          )}
                        </StatusIcon>
                      </>
                    ) : (
                      '--'
                    )}
                  </PromedioCell>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableWrapper>
    </TableContainer>
  );
}

