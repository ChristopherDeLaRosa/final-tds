import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles';
import Card from '../../atoms/Card/Card';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';

const TableCard = styled(Card)`
  overflow: hidden;
  margin-bottom: ${theme.spacing.lg};
`;

const TableHeader = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.backgroundAlt};
  border-bottom: 2px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const Title = styled.h3`
  margin: 0;
  color: ${theme.colors.textPrimary};
  font-size: ${theme.fontSize.lg};
  font-weight: 600;
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const QuickButton = styled(Button)`
  font-size: ${theme.fontSize.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
`;

const SearchBar = styled(Input)`
  max-width: 300px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.border};
  }

  th {
    background: ${theme.colors.backgroundAlt};
    font-weight: 600;
    color: ${theme.colors.textPrimary};
    font-size: ${theme.fontSize.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tbody tr {
    transition: background-color 0.2s;

    &:hover {
      background: ${theme.colors.backgroundAlt};
    }
  }
`;

const EstadoButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const EstadoButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: 2px solid ${props => props.$isActive ? props.$color : theme.colors.border};
  background: ${props => props.$isActive ? props.$color : 'transparent'};
  color: ${props => props.$isActive ? '#fff' : theme.colors.textSecondary};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.fontSize.xs};
  font-weight: 600;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ObservacionesInput = styled(Input)`
  font-size: ${theme.fontSize.sm};
`;

const EstudianteInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const EstudianteNombre = styled.div`
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const EstudianteMatricula = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const StatsBar = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.backgroundAlt};
  border-top: 1px solid ${theme.colors.border};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: ${theme.fontSize.xl};
  font-weight: 700;
  color: ${props => props.$color || theme.colors.textPrimary};
`;

const ESTADOS = [
  { value: 'Presente', label: 'P', color: '#10b981', fullLabel: 'Presente' },
  { value: 'Ausente', label: 'A', color: '#ef4444', fullLabel: 'Ausente' },
  { value: 'Tardanza', label: 'T', color: '#f59e0b', fullLabel: 'Tardanza' },
  { value: 'Justificado', label: 'J', color: '#3b82f6', fullLabel: 'Justificado' },
];

export default function PaseListaTable({
  estudiantes,
  asistencias,
  onCambiarEstado,
  onCambiarObservaciones,
  onMarcarTodos,
  disabled = false,
}) {
  const [busqueda, setBusqueda] = useState('');

  const estudiantesFiltrados = estudiantes.filter(est => {
    if (!busqueda) return true;
    const searchLower = busqueda.toLowerCase();
    return (
      est.nombreCompleto?.toLowerCase().includes(searchLower) ||
      est.matricula?.toLowerCase().includes(searchLower)
    );
  });

  const calcularEstadisticas = () => {
    const stats = {
      presentes: 0,
      ausentes: 0,
      tardanzas: 0,
      justificados: 0,
    };

    estudiantes.forEach(est => {
      const estado = asistencias[est.estudianteId]?.estado;
      if (estado === 'Presente') stats.presentes++;
      else if (estado === 'Ausente') stats.ausentes++;
      else if (estado === 'Tardanza') stats.tardanzas++;
      else if (estado === 'Justificado') stats.justificados++;
    });

    return stats;
  };

  const stats = calcularEstadisticas();
  const porcentajeAsistencia = estudiantes.length > 0
    ? Math.round((stats.presentes / estudiantes.length) * 100)
    : 0;

  return (
    <TableCard>
      <TableHeader>
        <Title>Lista de Estudiantes ({estudiantesFiltrados.length})</Title>
        
        <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchBar
            type="text"
            placeholder="Buscar estudiante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          
          <QuickActions>
            <QuickButton
              variant="outline"
              size="small"
              onClick={() => onMarcarTodos('Presente')}
              disabled={disabled}
            >
              Todos Presentes
            </QuickButton>
            <QuickButton
              variant="outline"
              size="small"
              onClick={() => onMarcarTodos('Ausente')}
              disabled={disabled}
            >
              Todos Ausentes
            </QuickButton>
          </QuickActions>
        </div>
      </TableHeader>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Estudiante</th>
              <th style={{ width: '240px', textAlign: 'center' }}>Estado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {estudiantesFiltrados.map((estudiante, index) => {
              const estadoActual = asistencias[estudiante.estudianteId]?.estado || 'Presente';
              const observaciones = asistencias[estudiante.estudianteId]?.observaciones || '';

              return (
                <tr key={estudiante.estudianteId}>
                  <td style={{ fontWeight: 600, color: theme.colors.textSecondary }}>
                    {index + 1}
                  </td>
                  
                  <td>
                    <EstudianteInfo>
                      <EstudianteNombre>{estudiante.nombreCompleto}</EstudianteNombre>
                      <EstudianteMatricula>Mat: {estudiante.matricula}</EstudianteMatricula>
                    </EstudianteInfo>
                  </td>
                  
                  <td>
                    <EstadoButtonGroup>
                      {ESTADOS.map(estado => (
                        <EstadoButton
                          key={estado.value}
                          type="button"
                          $isActive={estadoActual === estado.value}
                          $color={estado.color}
                          onClick={() => onCambiarEstado(estudiante.estudianteId, estado.value)}
                          disabled={disabled}
                          title={estado.fullLabel}
                        >
                          {estado.label}
                        </EstadoButton>
                      ))}
                    </EstadoButtonGroup>
                  </td>
                  
                  <td>
                    <ObservacionesInput
                      type="text"
                      placeholder="Observaciones opcionales..."
                      value={observaciones}
                      onChange={(e) => onCambiarObservaciones(
                        estudiante.estudianteId, 
                        e.target.value
                      )}
                      disabled={disabled}
                      maxLength={300}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrapper>

      <StatsBar>
        <StatItem>
          <StatLabel>Total</StatLabel>
          <StatValue>{estudiantes.length}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Presentes</StatLabel>
          <StatValue $color="#10b981">{stats.presentes}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Ausentes</StatLabel>
          <StatValue $color="#ef4444">{stats.ausentes}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Tardanzas</StatLabel>
          <StatValue $color="#f59e0b">{stats.tardanzas}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Asistencia</StatLabel>
          <StatValue $color="#3b82f6">{porcentajeAsistencia}%</StatValue>
        </StatItem>
      </StatsBar>
    </TableCard>
  );
}
