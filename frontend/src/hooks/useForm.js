import { useState } from 'react';

/**
 * Hook personalizado para manejar formularios de manera reutilizable
 * 
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} onSubmit - Función a ejecutar al enviar el formulario
 * @param {Function} validate - Función de validación personalizada
 * 
 * @returns {Object} - Estado y funciones del formulario
 */
export const useForm = (initialValues = {}, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar un campo específico
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Marcar campo como tocado
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar el campo individual si hay función de validación
    if (validate) {
      const fieldErrors = validate({ [name]: values[name] });
      if (fieldErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: fieldErrors[name]
        }));
      }
    }
  };

  // Establecer valores del formulario (útil para edición)
  const setFormValues = (newValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  };

  // Establecer un campo específico
  const setFieldValue = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Establecer error de un campo específico
  const setFieldError = (name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Resetear formulario
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Validar todos los campos
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      // Si hay errores, no enviar
      if (Object.keys(validationErrors).length > 0) {
        // Marcar todos los campos como tocados
        const allTouched = Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        setTouched(allTouched);
        return;
      }
    }

    // Ejecutar función de submit
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      resetForm();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      // Puedes manejar errores del servidor aquí
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFormValues,
    setFieldValue,
    setFieldError,
    resetForm,
  };
};

/**
 * Validadores comunes reutilizables
 */
export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Este campo es requerido';
    }
    return '';
  },

  email: (value) => {
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      return 'Email inválido';
    }
    return '';
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Mínimo ${min} caracteres`;
    }
    return '';
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Máximo ${max} caracteres`;
    }
    return '';
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message || 'Formato inválido';
    }
    return '';
  },

  number: (value) => {
    if (value && isNaN(value)) {
      return 'Debe ser un número';
    }
    return '';
  },

  min: (min) => (value) => {
    if (value && Number(value) < min) {
      return `Mínimo ${min}`;
    }
    return '';
  },

  max: (max) => (value) => {
    if (value && Number(value) > max) {
      return `Máximo ${max}`;
    }
    return '';
  },

  phone: (value) => {
    if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
      return 'Teléfono inválido';
    }
    return '';
  },

  url: (value) => {
    if (value && !/^https?:\/\/.+\..+/.test(value)) {
      return 'URL inválida';
    }
    return '';
  },
};

/**
 * Función helper para combinar múltiples validadores
 */
export const combineValidators = (...validatorFns) => (value) => {
  for (const validator of validatorFns) {
    const error = validator(value);
    if (error) return error;
  }
  return '';
};

/**
 * Función helper para crear esquema de validación
 * 
 * @example
 * const validationSchema = createValidationSchema({
 *   nombre: [validators.required, validators.minLength(3)],
 *   email: [validators.required, validators.email],
 *   edad: [validators.required, validators.number, validators.min(18)]
 * });
 */
export const createValidationSchema = (schema) => {
  return (values) => {
    const errors = {};

    Object.keys(schema).forEach(field => {
      const fieldValidators = schema[field];
      const value = values[field];

      for (const validator of fieldValidators) {
        const error = validator(value);
        if (error) {
          errors[field] = error;
          break; // Detener en el primer error
        }
      }
    });

    return errors;
  };
};
