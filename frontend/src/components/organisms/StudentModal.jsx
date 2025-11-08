import { useEffect } from 'react';
import Modal from '../molecules/Modal';
import {
  Form,
  FormGroup,
  FormRow,
  Label,
  Input,
  ErrorText,
  Button,
  SecondaryButton,
} from '../atoms/FormElements';
import { useForm, validators, createValidationSchema } from '../../hooks/useForm';
import estudianteService from '../../api/estudianteService';

// Esquema de validación para estudiante (campos reales de tu API)
const validationSchema = createValidationSchema({
  nombres: [validators.required, validators.minLength(2)],
  apellidos: [validators.required, validators.minLength(2)],
  email: [validators.required, validators.email],
  matricula: [validators.required],
  fechaNacimiento: [validators.required],
  telefono: [validators.phone],
});

export default function StudentModal({ isOpen, onClose, estudiante, onSuccess }) {
  const isEditMode = !!estudiante;

  // Valores iniciales del formulario (campos reales de tu API)
  const initialValues = {
    matricula: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    fechaIngreso: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    activo: true,
  };

  // Función de submit
  const handleFormSubmit = async (values) => {
    try {
      // Formatear fechas para la API
      const dataToSend = {
        ...values,
        fechaNacimiento: values.fechaNacimiento ? `${values.fechaNacimiento}T00:00:00` : null,
        fechaIngreso: values.fechaIngreso ? `${values.fechaIngreso}T00:00:00` : null,
      };

      if (isEditMode) {
        await estudianteService.update(estudiante.id, dataToSend);
        alert('✓ Estudiante actualizado exitosamente');
      } else {
        await estudianteService.create(dataToSend);
        alert('✓ Estudiante creado exitosamente');
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`✗ Error: ${err.response.data.message}`);
      } else if (err.response?.data?.errors) {
        // Manejar errores de validación de .NET
        const errorMessages = Object.values(err.response.data.errors).flat().join('\n');
        alert(`✗ Error de validación:\n${errorMessages}`);
      } else {
        alert('✗ Error al guardar el estudiante. Por favor, intenta de nuevo.');
      }
      throw err;
    }
  };

  // Hook de formulario
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFormValues,
  } = useForm(initialValues, handleFormSubmit, validationSchema);

  // Cargar datos del estudiante al editar
  useEffect(() => {
    if (estudiante) {
      // Formatear fechas de ISO a YYYY-MM-DD para input type="date"
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return fecha.split('T')[0];
      };

      setFormValues({
        matricula: estudiante.matricula || '',
        nombres: estudiante.nombres || '',
        apellidos: estudiante.apellidos || '',
        email: estudiante.email || '',
        telefono: estudiante.telefono || '',
        direccion: estudiante.direccion || '',
        fechaNacimiento: formatearFecha(estudiante.fechaNacimiento),
        fechaIngreso: formatearFecha(estudiante.fechaIngreso),
        activo: estudiante.activo ?? true,
      });
    }
  }, [estudiante, setFormValues]);

  // Handler mejorado para cambios en inputs
  const handleInputChange = (e) => {
    // Prevenir cualquier interferencia del evento
    e.stopPropagation();
    handleChange(e);
  };

  // Footer del modal con botones
  const modalFooter = (
    <>
      <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
        Cancelar
      </SecondaryButton>
      <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      footer={modalFooter}
      maxWidth="700px"
      closeOnOverlayClick={!isSubmitting}
    >
      <Form onSubmit={handleSubmit}>
        {/* Matrícula */}
        <FormGroup>
          <Label required>Matrícula {isEditMode && '(No editable)'}</Label>
          <Input
            type="text"
            name="matricula"
            value={values.matricula}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={isSubmitting || isEditMode}
            placeholder="Ej: 2024001"
            error={touched.matricula && errors.matricula}
            autoComplete="off"
          />
          {touched.matricula && errors.matricula && <ErrorText>{errors.matricula}</ErrorText>}
        </FormGroup>

        {/* Nombres y Apellidos */}
        <FormRow columns="1fr 1fr">
          <FormGroup>
            <Label required>Nombres</Label>
            <Input
              type="text"
              name="nombres"
              value={values.nombres}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              placeholder="Ej: Juan Carlos"
              error={touched.nombres && errors.nombres}
              autoComplete="off"
            />
            {touched.nombres && errors.nombres && <ErrorText>{errors.nombres}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label required>Apellidos</Label>
            <Input
              type="text"
              name="apellidos"
              value={values.apellidos}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              placeholder="Ej: Pérez López"
              error={touched.apellidos && errors.apellidos}
              autoComplete="off"
            />
            {touched.apellidos && errors.apellidos && <ErrorText>{errors.apellidos}</ErrorText>}
          </FormGroup>
        </FormRow>

        {/* Email */}
        <FormGroup>
          <Label required>Email</Label>
          <Input
            type="email"
            name="email"
            value={values.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="estudiante@colegio.edu"
            error={touched.email && errors.email}
            autoComplete="off"
          />
          {touched.email && errors.email && <ErrorText>{errors.email}</ErrorText>}
        </FormGroup>

        {/* Teléfono y Fecha de Nacimiento */}
        <FormRow columns="1fr 1fr">
          <FormGroup>
            <Label>Teléfono</Label>
            <Input
              type="tel"
              name="telefono"
              value={values.telefono}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              placeholder="809-555-1234"
              error={touched.telefono && errors.telefono}
              autoComplete="off"
            />
            {touched.telefono && errors.telefono && <ErrorText>{errors.telefono}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label required>Fecha de Nacimiento</Label>
            <Input
              type="date"
              name="fechaNacimiento"
              value={values.fechaNacimiento}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.fechaNacimiento && errors.fechaNacimiento}
            />
            {touched.fechaNacimiento && errors.fechaNacimiento && (
              <ErrorText>{errors.fechaNacimiento}</ErrorText>
            )}
          </FormGroup>
        </FormRow>

        {/* Dirección */}
        <FormGroup>
          <Label>Dirección</Label>
          <Input
            type="text"
            name="direccion"
            value={values.direccion}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="Dirección completa"
            autoComplete="off"
          />
        </FormGroup>

        {/* Fecha de Ingreso (solo mostrar al crear) */}
        {!isEditMode && (
          <FormGroup>
            <Label>Fecha de Ingreso</Label>
            <Input
              type="date"
              name="fechaIngreso"
              value={values.fechaIngreso}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
          </FormGroup>
        )}
      </Form>
    </Modal>
  );
}
