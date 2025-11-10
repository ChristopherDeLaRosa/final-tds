import { useState, useEffect, useCallback } from 'react';
import { MySwal, Toast } from '../utils/alerts';

export const useCrud = (service, options = {}) => {
  const {
    onSuccess,
    onError,
    initialFetch = true,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all items
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.getAll();
      setData(result);
      return result;
    } catch (err) {
      const errorMsg = 'Error al cargar los datos. Por favor, verifica tu conexión e intenta de nuevo.';
      setError(errorMsg);
      console.error('Error fetching data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Create item
  const create = useCallback(async (itemData) => {
    try {
      MySwal.fire({
        title: 'Guardando...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => MySwal.showLoading(),
      });

      const result = await service.create(itemData);
      
      MySwal.close();
      Toast.fire({ icon: 'success', title: 'Registro creado exitosamente' });
      
      await fetchAll();
      onSuccess?.('create', result);
      
      return result;
    } catch (err) {
      MySwal.close();
      handleError(err);
      onError?.('create', err);
      throw err;
    }
  }, [service, fetchAll, onSuccess, onError]);

  // Update item
  const update = useCallback(async (id, itemData) => {
    try {
      MySwal.fire({
        title: 'Actualizando...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => MySwal.showLoading(),
      });

      const result = await service.update(id, itemData);
      
      MySwal.close();
      Toast.fire({ icon: 'success', title: 'Registro actualizado exitosamente' });
      
      await fetchAll();
      onSuccess?.('update', result);
      
      return result;
    } catch (err) {
      MySwal.close();
      handleError(err);
      onError?.('update', err);
      throw err;
    }
  }, [service, fetchAll, onSuccess, onError]);

  // Delete item
  const remove = useCallback(async (id, itemName = 'este registro') => {
    const { isConfirmed } = await MySwal.fire({
      title: `¿Eliminar ${itemName}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!isConfirmed) return false;

    try {
      MySwal.fire({
        title: 'Eliminando...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => MySwal.showLoading(),
      });

      await service.delete(id);
      setData(prev => prev.filter(item => item.id !== id));

      MySwal.close();
      Toast.fire({ icon: 'success', title: 'Registro eliminado exitosamente' });
      
      onSuccess?.('delete', id);
      return true;
    } catch (err) {
      MySwal.close();
      MySwal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: 'Por favor, intenta de nuevo.',
      });
      onError?.('delete', err);
      throw err;
    }
  }, [service, onSuccess, onError]);

  // Handle errors
  const handleError = (err) => {
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
  };

  // Initial fetch
  useEffect(() => {
    if (initialFetch) {
      fetchAll();
    }
  }, [fetchAll, initialFetch]);

  return {
    data,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    setData,
    setError,
  };
};