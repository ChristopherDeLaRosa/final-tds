import { useState, useEffect } from 'react';
import periodoService from '../../../services/periodoService';

const PeriodoSelector = ({ value, onChange, className = '', showActual = true }) => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeriodos();
  }, []);

  const loadPeriodos = async () => {
    try {
      setLoading(true);
      const data = await periodoService.getAll();
      setPeriodos(data);
      
      // Si showActual y no hay value, seleccionar el actual
      if (showActual && !value && data.length > 0) {
        const actual = data.find(p => p.esActual);
        if (actual && onChange) {
          onChange(actual.id);
        }
      }
    } catch (error) {
      console.error('Error al cargar períodos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <select className={className} disabled>
        <option>Cargando períodos...</option>
      </select>
    );
  }

  return (
    <select
      className={className}
      value={value || ''}
      onChange={(e) => onChange && onChange(Number(e.target.value))}
    >
      <option value="">Seleccione un período</option>
      {periodos.map((periodo) => (
        <option key={periodo.id} value={periodo.id}>
          {periodo.nombre} - {periodo.trimestre}
          {periodo.esActual && ' (Actual)'}
        </option>
      ))}
    </select>
  );
};

export default PeriodoSelector;