import { useState, useCallback } from 'react';
import { Toast } from '../utils/alerts';

export const useFormValidation = (validationRules = {}) => {
  const [errors, setErrors] = useState({});

  const validate = useCallback((formData) => {
    const newErrors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const rules = validationRules[fieldName];
      const value = formData[fieldName];

      // Required validation
      if (rules.required && !value?.toString().trim()) {
        newErrors[fieldName] = rules.required.message || `${fieldName} es requerido`;
        return;
      }

      // Min length validation
      if (rules.minLength && value?.toString().trim().length < rules.minLength.value) {
        newErrors[fieldName] = rules.minLength.message || 
          `Debe tener al menos ${rules.minLength.value} caracteres`;
        return;
      }

      // Max length validation
      if (rules.maxLength && value?.toString().trim().length > rules.maxLength.value) {
        newErrors[fieldName] = rules.maxLength.message || 
          `No debe exceder ${rules.maxLength.value} caracteres`;
        return;
      }

      // Pattern validation (email, phone, etc.)
      if (rules.pattern && value && !rules.pattern.value.test(value)) {
        newErrors[fieldName] = rules.pattern.message || 'Formato inválido';
        return;
      }

      // Custom validation
      if (rules.custom) {
        const customError = rules.custom(value, formData);
        if (customError) {
          newErrors[fieldName] = customError;
          return;
        }
      }
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      Toast.fire({ icon: 'info', title: 'Revisa los campos obligatorios' });
    }
    
    return Object.keys(newErrors).length === 0;
  }, [validationRules]);

  const clearError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
    setErrors,
  };
};