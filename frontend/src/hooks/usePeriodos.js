import { useState, useEffect, useCallback } from 'react';
import periodoService from '../services/periodoService';

export const usePeriodos = () => {
  const [periodos, setPeriodos] = useState([]);
  const [periodoActual, setPeriodoActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPeriodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [allPeriodos, actual] = await Promise.all([
        periodoService.getAll(),
        periodoService.getPeriodoActual().catch(() => null)
      ]);
      
      setPeriodos(allPeriodos || []);
      setPeriodoActual(actual);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar períodos';
      setError(errorMsg);
      console.error('Error loading períodos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPeriodos();
  }, [loadPeriodos]);

  const getPeriodoById = useCallback((id) => {
    return periodos.find(p => p.id === id);
  }, [periodos]);

  const getPeriodoByNombre = useCallback((nombre) => {
    return periodos.find(p => p.nombre === nombre);
  }, [periodos]);

  return {
    periodos,
    periodoActual,
    loading,
    error,
    reload: loadPeriodos,
    getPeriodoById,
    getPeriodoByNombre,
  };
};

// Hook para obtener un período específico
export const usePeriodo = (periodoId) => {
  const [periodo, setPeriodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!periodoId) {
      setLoading(false);
      return;
    }

    const loadPeriodo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await periodoService.getById(periodoId);
        setPeriodo(data);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Error al cargar período';
        setError(errorMsg);
        console.error('Error loading período:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPeriodo();
  }, [periodoId]);

  return { periodo, loading, error };
};

