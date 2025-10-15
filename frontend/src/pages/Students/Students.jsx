import { useState } from 'react';
import {DataTable} from '../../components';
import {theme} from '../../styles';

export default function Students() {
  // Estado para los estudiantes
  const [estudiantes, setEstudiantes] = useState([
    { id: 1, nombre: 'Carlos Pérez', email: 'cperez@colegio.edu', nivel: 'Bachillerato', grado: '1ro', edad: 15, seccion: 'A' },
    { id: 2, nombre: 'María González', email: 'mgonzalez@colegio.edu', nivel: 'Básica', grado: '8vo', edad: 13, seccion: 'B' },
    { id: 3, nombre: 'Juan Martínez', email: 'jmartinez@colegio.edu', nivel: 'Bachillerato', grado: '2do', edad: 16, seccion: 'A' },
    { id: 4, nombre: 'Ana Rodríguez', email: 'arodriguez@colegio.edu', nivel: 'Básica', grado: '7mo', edad: 12, seccion: 'C' },
    { id: 5, nombre: 'Pedro Sánchez', email: 'psanchez@colegio.edu', nivel: 'Bachillerato', grado: '3ro', edad: 17, seccion: 'B' },
    { id: 6, nombre: 'Laura Fernández', email: 'lfernandez@colegio.edu', nivel: 'Básica', grado: '6to', edad: 11, seccion: 'A' },
    { id: 7, nombre: 'Diego López', email: 'dlopez@colegio.edu', nivel: 'Bachillerato', grado: '4to', edad: 18, seccion: 'A' },
    { id: 8, nombre: 'Sofía Ramírez', email: 'sramirez@colegio.edu', nivel: 'Básica', grado: '5to', edad: 10, seccion: 'B' },
    { id: 9, nombre: 'Miguel Torres', email: 'mtorres@colegio.edu', nivel: 'Bachillerato', grado: '2do', edad: 16, seccion: 'C' },
    { id: 10, nombre: 'Valentina Cruz', email: 'vcruz@colegio.edu', nivel: 'Básica', grado: '8vo', edad: 13, seccion: 'A' },
    { id: 11, nombre: 'Roberto Díaz', email: 'rdiaz@colegio.edu', nivel: 'Básica', grado: '7mo', edad: 12, seccion: 'B' },
    { id: 12, nombre: 'Isabella Mora', email: 'imora@colegio.edu', nivel: 'Bachillerato', grado: '1ro', edad: 15, seccion: 'B' },
  ]);

  const columns = [
    { key: 'id', title: 'ID', width: '60px' },
    { key: 'nombre', title: 'Nombre Completo' },
    { key: 'email', title: 'Correo Electrónico' },
    {
      key: 'nivel',
      title: 'Nivel',
      width: '130px',
      render: (value) => (
        <span style={{
          fontWeight: '600',
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: value === 'Bachillerato' ? '#dbeafe' : '#fef3c7',
          color: value === 'Bachillerato' ? '#1e40af' : '#92400e'
        }}>
          {value}
        </span>
      )
    },
    { 
      key: 'grado', 
      title: 'Grado',
      width: '80px',
      render: (value) => (
        <span style={{ fontWeight: '600' }}>
          {value}
        </span>
      )
    },
    { 
      key: 'seccion', 
      title: 'Sección',
      width: '90px',
      render: (value) => (
        <span style={{
          display: 'inline-block',
          width: '32px',
          height: '32px',
          lineHeight: '32px',
          textAlign: 'center',
          fontWeight: '700',
          borderRadius: '50%',
          backgroundColor: '#e0e7ff',
          color: '#4338ca'
        }}>
          {value}
        </span>
      )
    },
    { key: 'edad', title: 'Edad', width: '70px' }
  ];

  const filterOptions = {
    nivel: [
      { value: 'Básica', label: 'Básica' },
      { value: 'Bachillerato', label: 'Bachillerato' }
    ],
    grado: [
      { value: '5to', label: '5to Grado' },
      { value: '6to', label: '6to Grado' },
      { value: '7mo', label: '7mo Grado' },
      { value: '8vo', label: '8vo Grado' },
      { value: '1ro', label: '1ro Bachillerato' },
      { value: '2do', label: '2do Bachillerato' },
      { value: '3ro', label: '3ro Bachillerato' },
      { value: '4to', label: '4to Bachillerato' }
    ],
    seccion: [
      { value: 'A', label: 'Sección A' },
      { value: 'B', label: 'Sección B' },
      { value: 'C', label: 'Sección C' }
    ]
  };

  // Función para editar estudiante
  const handleEdit = (estudiante) => {
    console.log('Editar estudiante:', estudiante);
    alert(`Editando: ${estudiante.nombre}\nGrado: ${estudiante.grado} - Sección: ${estudiante.seccion}\n\nEn una aplicación real, aquí abrirías un modal o formulario de edición.`);
  };

  // Función para eliminar estudiante
  const handleDelete = (estudiante) => {
    if (window.confirm(`¿Estás seguro de eliminar al estudiante ${estudiante.nombre}?\n\nGrado: ${estudiante.grado} - Sección: ${estudiante.seccion}`)) {
      setEstudiantes(estudiantes.filter(est => est.id !== estudiante.id));
      console.log('Estudiante eliminado:', estudiante);
      alert(`Estudiante ${estudiante.nombre} eliminado exitosamente`);
    }
  };

  // Función para agregar nuevo estudiante
  const handleAddStudent = () => {
    const newId = Math.max(...estudiantes.map(e => e.id)) + 1;
    const newStudent = {
      id: newId,
      nombre: 'Nuevo Estudiante',
      email: `estudiante${newId}@colegio.edu`,
      nivel: 'Básica',
      grado: '5to',
      edad: 10,
      seccion: 'A'
    };
    setEstudiantes([...estudiantes, newStudent]);
    alert('Nuevo estudiante agregado. En una aplicación real, mostrarías un formulario.');
  };

  // Estadísticas
  const totalBasica = estudiantes.filter(e => e.nivel === 'Básica').length;
  const totalBachillerato = estudiantes.filter(e => e.nivel === 'Bachillerato').length;

  return (
    <div style={{
      padding: theme.spacing.xl,
      background: theme.colors.background,
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl
      }}>
        <div>
          <h1 style={{
            color: theme.colors.text,
            fontSize: theme.fontSize.xl,
            fontWeight: '600',
            margin: 0,
            marginBottom: '8px'
          }}>
            Gestión de Estudiantes
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '14px',
            margin: 0
          }}>
            Sistema de registro escolar - Básica y Bachillerato
          </p>
        </div>
        
        <button
          onClick={handleAddStudent}
          style={{
            padding: '12px 24px',
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = theme.colors.primary;
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
          }}
        >
          {/* no puse icono aqui porque es un ejemplo */}
          + Agregar Estudiante
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: theme.spacing.lg,
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px'
          }}>
            Total Estudiantes
          </p>
          <p style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: '700',
            color: theme.colors.text
          }}>
            {estudiantes.length}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: theme.spacing.lg,
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px'
          }}>
            Nivel Básica
          </p>
          <p style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: '700',
            color: theme.colors.text
          }}>
            {totalBasica}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: theme.spacing.lg,
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #06b6d4'
        }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px'
          }}>
            Bachillerato
          </p>
          <p style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: '700',
            color: theme.colors.text
          }}>
            {totalBachillerato}
          </p>
        </div>
      </div>

      {/* Tabla de estudiantes */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: theme.spacing.lg,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <DataTable
          data={estudiantes}
          columns={columns}
          searchFields={['nombre', 'email']}
          filterOptions={filterOptions}
          // initialItemsPerPage={10}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          emptyMessage="No hay estudiantes registrados"
          loadingMessage="Cargando estudiantes..."
        />
      </div>
    </div>
  );
};
