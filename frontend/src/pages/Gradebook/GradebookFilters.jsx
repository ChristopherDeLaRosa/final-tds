import { Search } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles';

const FiltersContainer = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  color: ${theme.colors.text};
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.text};
  background: ${theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${theme.colors.accent};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 3px ${theme.colors.accent}20;
  }
`;

const LoadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.accent};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: ${theme.colors.accentHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoText = styled.p`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textMuted};
  text-align: center;
`;

export default function GradebookFilters({
  periodos = [],
  grupos = [],
  selectedPeriodo,
  selectedGrupo,
  onPeriodoChange,
  onGrupoChange,
  onLoadGradebook,
  loading = false,
}) {
  const selectedGrupoData = grupos.find(g => g.id === selectedGrupo);
  
  return (
    <FiltersContainer>
      <FiltersGrid>
        {/* Período */}
        <FormGroup>
          <Label htmlFor="periodo">Período Académico</Label>
          <Select
            id="periodo"
            value={selectedPeriodo || ''}
            onChange={(e) => onPeriodoChange(e.target.value ? parseInt(e.target.value) : null)}
            disabled={loading}
          >
            <option value="">Selecciona un período</option>
            {periodos.map(periodo => (
              <option key={periodo.id} value={periodo.id}>
                {periodo.nombre} {periodo.esActual ? '(Actual)' : ''}
              </option>
            ))}
          </Select>
        </FormGroup>

        {/* Grupo-Curso */}
        <FormGroup>
          <Label htmlFor="grupo">Grupo-Curso</Label>
          <Select
            id="grupo"
            value={selectedGrupo || ''}
            onChange={(e) => onGrupoChange(e.target.value ? parseInt(e.target.value) : null)}
            disabled={loading || !selectedPeriodo || grupos.length === 0}
          >
            <option value="">Selecciona un grupo</option>
            {grupos.map(grupo => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nombreCurso} - {grupo.grado}° {grupo.seccion}
              </option>
            ))}
          </Select>
        </FormGroup>

        {/* Botón Cargar */}
        <FormGroup style={{ alignSelf: 'flex-end' }}>
          <LoadButton
            onClick={onLoadGradebook}
            disabled={loading || !selectedGrupo}
          >
            <Search size={18} />
            Cargar Libro
          </LoadButton>
        </FormGroup>
      </FiltersGrid>

      {/* Información del grupo seleccionado */}
      {selectedGrupoData && (
        <InfoText>
          {selectedGrupoData.nombreCurso} · 
          Grado {selectedGrupoData.grado}° Sección {selectedGrupoData.seccion} · 
          Código: {selectedGrupoData.codigo}
        </InfoText>
      )}
    </FiltersContainer>
  );
}

