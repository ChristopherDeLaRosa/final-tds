import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Calendar, 
  Clock, 
  Save, 
  X, 
  Plus, 
  Copy, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Zap,
  BookOpen,
  User
} from 'lucide-react';
import { MySwal, Toast } from '../../utils/alerts';
import cursoService from '../../services/cursoService';
import docenteService from '../../services/docenteService';
import aulaService from '../../services/aulaService';

const ConfigurarHorarioNuevo = ({ aulaId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [aula, setAula] = useState(null);

  // Estado del horario: matriz de días x horas
  const [horario, setHorario] = useState({});
  
  // Configuración de bloques horarios
  const [bloques, setBloques] = useState([
    { inicio: '08:00', fin: '08:45', orden: 1 },
    { inicio: '08:45', fin: '09:30', orden: 2 },
    { inicio: '09:30', fin: '10:15', orden: 3 },
    { inicio: '10:15', fin: '11:00', orden: 4 },
    { inicio: '11:15', fin: '12:00', orden: 5 },
    { inicio: '12:00', fin: '12:45', orden: 6 },
    { inicio: '13:00', fin: '13:45', orden: 7 },
    { inicio: '13:45', fin: '14:30', orden: 8 }
  ]);

  const diasSemana = [
    { key: 'Monday', label: 'Lunes' },
    { key: 'Tuesday', label: 'Martes' },
    { key: 'Wednesday', label: 'Miércoles' },
    { key: 'Thursday', label: 'Jueves' },
    { key: 'Friday', label: 'Viernes' }
  ];

  // Celda seleccionada para edición rápida
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  
  // Modo de copia rápida
  const [modoCopia, setModoCopia] = useState(false);
  const [celdaCopiada, setCeldaCopiada] = useState(null);

  // Vista de formulario lateral
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    cursoId: '',
    docenteId: '',
    dia: '',
    bloqueInicio: '',
    bloqueFin: ''
  });

  useEffect(() => {
    loadData();
  }, [aulaId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [cursosData, docentesData, aulaData] = await Promise.all([
        cursoService.getAll(),
        docenteService.getAll(),
        aulaService.getById(aulaId)
      ]);

      setCursos(Array.isArray(cursosData) ? cursosData : []);
      setDocentes(Array.isArray(docentesData) ? docentesData : []);
      setAula(aulaData);

      // Cargar horarios existentes
      const horariosData = await aulaService.getHorarios(aulaId);
      if (horariosData && horariosData.length > 0) {
        cargarHorariosExistentes(horariosData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos'
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarHorariosExistentes = (horariosData) => {
    const horarioMap = {};
    
    horariosData.forEach(h => {
      const key = `${h.diaSemana}-${h.horaInicio}`;
      horarioMap[key] = {
        id: h.id,
        cursoId: h.cursoId,
        nombreCurso: h.nombreCurso,
        codigoCurso: h.codigoCurso,
        docenteId: h.docenteId,
        nombreDocente: h.nombreDocente,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
        orden: h.orden
      };
    });

    setHorario(horarioMap);
  };

  // Manejar clic en celda
  const handleCeldaClick = (dia, bloque) => {
    const key = `${dia}-${bloque.inicio}`;
    
    if (modoCopia && celdaCopiada) {
      // Copiar datos
      const datosCopiados = horario[celdaCopiada];
      if (datosCopiados) {
        setHorario(prev => ({
          ...prev,
          [key]: {
            ...datosCopiados,
            id: undefined, // Quitar ID para que sea una nueva entrada
            horaInicio: bloque.inicio,
            horaFin: bloque.fin,
            orden: bloque.orden
          }
        }));
        Toast.fire({
          icon: 'success',
          title: 'Clase copiada'
        });
      }
      setModoCopia(false);
      setCeldaCopiada(null);
    } else {
      // Seleccionar para edición
      setCeldaSeleccionada(key);
      setMostrarFormulario(true);
      
      const celdaData = horario[key];
      if (celdaData) {
        setFormData({
          cursoId: celdaData.cursoId,
          docenteId: celdaData.docenteId,
          dia: dia,
          bloqueInicio: bloque.orden,
          bloqueFin: bloque.orden
        });
      } else {
        setFormData({
          cursoId: '',
          docenteId: '',
          dia: dia,
          bloqueInicio: bloque.orden,
          bloqueFin: bloque.orden
        });
      }
    }
  };

  // Guardar clase en celda
  const guardarClase = () => {
    if (!formData.cursoId || !formData.docenteId) {
      Toast.fire({
        icon: 'warning',
        title: 'Selecciona curso y docente'
      });
      return;
    }

    const curso = cursos.find(c => c.id === parseInt(formData.cursoId));
    const docente = docentes.find(d => d.id === parseInt(formData.docenteId));

    // Validar que bloqueFin >= bloqueInicio
    if (formData.bloqueFin < formData.bloqueInicio) {
      Toast.fire({
        icon: 'warning',
        title: 'El bloque final debe ser igual o posterior al inicial'
      });
      return;
    }

    // Crear entradas para todos los bloques en el rango
    const nuevasEntradas = {};
    
    for (let i = formData.bloqueInicio; i <= formData.bloqueFin; i++) {
      const bloque = bloques[i - 1];
      const key = `${formData.dia}-${bloque.inicio}`;
      
      const entradaExistente = horario[key];
      
      nuevasEntradas[key] = {
        id: entradaExistente?.id,
        cursoId: curso.id,
        nombreCurso: curso.nombre,
        codigoCurso: curso.codigo,
        docenteId: docente.id,
        nombreDocente: `${docente.nombres} ${docente.apellidos}`,
        horaInicio: bloque.inicio,
        horaFin: bloque.fin,
        orden: bloque.orden
      };
    }

    setHorario(prev => ({
      ...prev,
      ...nuevasEntradas
    }));

    setMostrarFormulario(false);
    setCeldaSeleccionada(null);
    
    Toast.fire({
      icon: 'success',
      title: 'Clase agregada'
    });
  };

  // Eliminar clase de celda
  const eliminarClase = (key) => {
    setHorario(prev => {
      const nuevoHorario = { ...prev };
      delete nuevoHorario[key];
      return nuevoHorario;
    });
    
    Toast.fire({
      icon: 'success',
      title: 'Clase eliminada'
    });
  };

  // Activar modo copia
  const activarModoCopia = (key) => {
    setModoCopia(true);
    setCeldaCopiada(key);
    Toast.fire({
      icon: 'info',
      title: 'Haz clic en otra celda para copiar'
    });
  };

  // Duplicar día completo
  const duplicarDia = async (diaOrigen) => {
    const { value: diaDestino } = await MySwal.fire({
      title: 'Duplicar día',
      text: `¿A qué día quieres copiar el horario de ${diasSemana.find(d => d.key === diaOrigen)?.label}?`,
      input: 'select',
      inputOptions: diasSemana.reduce((acc, d) => {
        if (d.key !== diaOrigen) {
          acc[d.key] = d.label;
        }
        return acc;
      }, {}),
      showCancelButton: true,
      confirmButtonText: 'Duplicar',
      cancelButtonText: 'Cancelar'
    });

    if (diaDestino) {
      const nuevasEntradas = {};
      
      Object.entries(horario).forEach(([key, value]) => {
        if (key.startsWith(diaOrigen)) {
          const bloqueInicio = key.split('-')[1];
          const nuevaKey = `${diaDestino}-${bloqueInicio}`;
          nuevasEntradas[nuevaKey] = {
            ...value,
            id: undefined // Quitar ID para que sea una nueva entrada
          };
        }
      });

      setHorario(prev => ({
        ...prev,
        ...nuevasEntradas
      }));

      Toast.fire({
        icon: 'success',
        title: `Horario copiado a ${diasSemana.find(d => d.key === diaDestino)?.label}`
      });
    }
  };

  // Guardar todo el horario
  const guardarHorarioCompleto = async () => {
    if (Object.keys(horario).length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'No hay clases configuradas'
      });
      return;
    }

    const { isConfirmed } = await MySwal.fire({
      title: '¿Guardar horario completo?',
      html: `
        <div style="text-align: left; margin-top: 1rem;">
          <p><strong>${Object.keys(horario).length}</strong> bloques de clases configurados</p>
          <p style="margin-top: 0.5rem; color: #64748b; font-size: 0.9rem;">
            Se crearán los horarios, grupos-cursos y sesiones automáticamente
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    try {
      setLoading(true);

      MySwal.fire({
        title: 'Guardando horario...',
        html: 'Por favor espera',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false
      });

      // Convertir el mapa de horario a array de DTOs
      const horariosDto = Object.values(horario).map(h => ({
        cursoId: h.cursoId,
        docenteId: h.docenteId,
        diaSemana: Object.keys(horario).find(k => horario[k] === h).split('-')[0],
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
        orden: h.orden
      }));

      const configDto = {
        aulaId: aulaId,
        horarios: horariosDto,
        generarGruposAutomaticamente: true,
        generarSesionesAutomaticamente: true
      };

      const resultado = await aulaService.configurarHorarioCompleto(aulaId, configDto);

      MySwal.close();

      if (resultado.exitoso) {
        await MySwal.fire({
          icon: 'success',
          title: '¡Horario guardado!',
          html: `
            <div style="text-align: left;">
              <p>✓ ${resultado.horariosCreados} horarios creados</p>
              <p>✓ ${resultado.gruposCursosCreados} grupos-cursos generados</p>
              <p>✓ ${resultado.sesionesGeneradas} sesiones programadas</p>
              ${resultado.errores.length > 0 ? 
                `<details style="margin-top: 1rem;">
                  <summary style="cursor: pointer; color: #f59e0b;">
                    Ver advertencias (${resultado.errores.length})
                  </summary>
                  <ul style="margin-top: 0.5rem; margin-left: 1rem; font-size: 0.9rem;">
                    ${resultado.errores.map(e => `<li>${e}</li>`).join('')}
                  </ul>
                </details>` : ''}
            </div>
          `
        });

        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: resultado.mensaje
        });
      }
    } catch (error) {
      MySwal.close();
      console.error('Error:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo guardar el horario'
      });
    } finally {
      setLoading(false);
    }
  };

  // Limpiar todo el horario
  const limpiarHorario = async () => {
    const { isConfirmed } = await MySwal.fire({
      title: '¿Limpiar todo el horario?',
      text: 'Se perderán todas las clases configuradas',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f44336'
    });

    if (isConfirmed) {
      setHorario({});
      Toast.fire({
        icon: 'success',
        title: 'Horario limpiado'
      });
    }
  };

  if (loading && !aula) {
    return (
      <Container>
        <LoadingMessage>Cargando...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={onClose}>
            <X size={20} />
          </BackButton>
          <TitleSection>
            <Title>Configurar Horario</Title>
            <Subtitle>
              {aula?.grado}° {aula?.seccion} • {aula?.periodo}
            </Subtitle>
          </TitleSection>
        </HeaderLeft>

        <HeaderActions>
          {modoCopia && (
            <ModoCopiaBadge>
              <Copy size={16} />
              Modo copia activado
              <button onClick={() => {
                setModoCopia(false);
                setCeldaCopiada(null);
              }}>
                <X size={14} />
              </button>
            </ModoCopiaBadge>
          )}
          
          <ActionButton 
            $color="#f44336" 
            onClick={limpiarHorario}
            disabled={Object.keys(horario).length === 0}
          >
            <Trash2 size={18} />
            Limpiar
          </ActionButton>

          <ActionButton 
            $color="#10b981"
            onClick={guardarHorarioCompleto}
            disabled={loading || Object.keys(horario).length === 0}
          >
            <Zap size={18} />
            Guardar y Generar
          </ActionButton>
        </HeaderActions>
      </Header>

      <Content>
        <HorarioGrid>
          <GridHeader>
            <CornerCell>Hora</CornerCell>
            {diasSemana.map(dia => (
              <DiaHeader key={dia.key}>
                <DiaLabel>{dia.label}</DiaLabel>
                <DuplicarButton 
                  onClick={() => duplicarDia(dia.key)}
                  title="Duplicar día"
                >
                  <Copy size={14} />
                </DuplicarButton>
              </DiaHeader>
            ))}
          </GridHeader>

          <GridBody>
            {bloques.map((bloque, bloqueIdx) => (
              <FilaHorario key={bloqueIdx}>
                <CeldaHora>
                  <HoraTexto>{bloque.inicio}</HoraTexto>
                  <HoraTexto small>{bloque.fin}</HoraTexto>
                </CeldaHora>

                {diasSemana.map(dia => {
                  const key = `${dia.key}-${bloque.inicio}`;
                  const claseData = horario[key];
                  const isSeleccionada = celdaSeleccionada === key;

                  return (
                    <CeldaClase
                      key={key}
                      onClick={() => handleCeldaClick(dia.key, bloque)}
                      $isSeleccionada={isSeleccionada}
                      $tieneClase={!!claseData}
                      $esCopiada={celdaCopiada === key}
                    >
                      {claseData ? (
                        <>
                          <ClaseInfo>
                            <ClaseNombre>{claseData.nombreCurso}</ClaseNombre>
                            <ClaseDocente>
                              <User size={12} />
                              {claseData.nombreDocente}
                            </ClaseDocente>
                          </ClaseInfo>
                          <ClaseAcciones>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                activarModoCopia(key);
                              }}
                              title="Copiar"
                            >
                              <Copy size={14} />
                            </IconButton>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarClase(key);
                              }}
                              $danger
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </ClaseAcciones>
                        </>
                      ) : (
                        <CeldaVacia>
                          <Plus size={16} />
                        </CeldaVacia>
                      )}
                    </CeldaClase>
                  );
                })}
              </FilaHorario>
            ))}
          </GridBody>
        </HorarioGrid>

        {mostrarFormulario && (
          <FormularioLateral>
            <FormHeader>
              <FormTitle>
                <BookOpen size={20} />
                {horario[celdaSeleccionada] ? 'Editar Clase' : 'Nueva Clase'}
              </FormTitle>
              <CloseFormButton onClick={() => {
                setMostrarFormulario(false);
                setCeldaSeleccionada(null);
              }}>
                <X size={20} />
              </CloseFormButton>
            </FormHeader>

            <FormBody>
              <FormGroup>
                <Label>Curso *</Label>
                <Select
                  value={formData.cursoId}
                  onChange={(e) => setFormData({ ...formData, cursoId: e.target.value })}
                >
                  <option value="">Seleccionar curso...</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.codigo} - {curso.nombre}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Docente *</Label>
                <Select
                  value={formData.docenteId}
                  onChange={(e) => setFormData({ ...formData, docenteId: e.target.value })}
                >
                  <option value="">Seleccionar docente...</option>
                  {docentes.map(docente => (
                    <option key={docente.id} value={docente.id}>
                      {docente.codigo} - {docente.nombres} {docente.apellidos}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Bloques</Label>
                <BlockRangeContainer>
                  <BlockSelect
                    value={formData.bloqueInicio}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      bloqueInicio: parseInt(e.target.value),
                      bloqueFin: Math.max(parseInt(e.target.value), formData.bloqueFin)
                    })}
                  >
                    {bloques.map((bloque, idx) => (
                      <option key={idx} value={bloque.orden}>
                        {bloque.inicio} - {bloque.fin}
                      </option>
                    ))}
                  </BlockSelect>
                  <span>hasta</span>
                  <BlockSelect
                    value={formData.bloqueFin}
                    onChange={(e) => setFormData({ ...formData, bloqueFin: parseInt(e.target.value) })}
                  >
                    {bloques
                      .filter(b => b.orden >= formData.bloqueInicio)
                      .map((bloque, idx) => (
                        <option key={idx} value={bloque.orden}>
                          {bloque.inicio} - {bloque.fin}
                        </option>
                      ))}
                  </BlockSelect>
                </BlockRangeContainer>
              </FormGroup>

              <InfoBox>
                <AlertCircle size={16} />
                <span>
                  {formData.bloqueFin > formData.bloqueInicio 
                    ? `Se crearán ${formData.bloqueFin - formData.bloqueInicio + 1} bloques consecutivos`
                    : 'Se creará 1 bloque de clase'}
                </span>
              </InfoBox>
            </FormBody>

            <FormFooter>
              <ButtonSecondary onClick={() => {
                setMostrarFormulario(false);
                setCeldaSeleccionada(null);
              }}>
                Cancelar
              </ButtonSecondary>
              <ButtonPrimary onClick={guardarClase}>
                <CheckCircle size={18} />
                Guardar
              </ButtonPrimary>
            </FormFooter>
          </FormularioLateral>
        )}
      </Content>

      <EstadisticasFooter>
        <Estadistica>
          <EstadisticaIcono $color="#3b82f6">
            <Calendar size={18} />
          </EstadisticaIcono>
          <EstadisticaInfo>
            <EstadisticaValor>{Object.keys(horario).length}</EstadisticaValor>
            <EstadisticaLabel>Bloques configurados</EstadisticaLabel>
          </EstadisticaInfo>
        </Estadistica>

        <Estadistica>
          <EstadisticaIcono $color="#10b981">
            <BookOpen size={18} />
          </EstadisticaIcono>
          <EstadisticaInfo>
            <EstadisticaValor>
              {new Set(Object.values(horario).map(h => h.cursoId)).size}
            </EstadisticaValor>
            <EstadisticaLabel>Cursos diferentes</EstadisticaLabel>
          </EstadisticaInfo>
        </Estadistica>

        <Estadistica>
          <EstadisticaIcono $color="#f59e0b">
            <User size={18} />
          </EstadisticaIcono>
          <EstadisticaInfo>
            <EstadisticaValor>
              {new Set(Object.values(horario).map(h => h.docenteId)).size}
            </EstadisticaValor>
            <EstadisticaLabel>Docentes asignados</EstadisticaLabel>
          </EstadisticaInfo>
        </Estadistica>
      </EstadisticasFooter>
    </Container>
  );
};

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
`;

const Header = styled.div`
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: #f1f5f9;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${p => p.$color || '#3b82f6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModoCopiaBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;

  button {
    background: none;
    border: none;
    color: #1e40af;
    cursor: pointer;
    display: flex;
    padding: 0;
    
    &:hover {
      opacity: 0.7;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 2rem;
  gap: 2rem;
`;

const HorarioGrid = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: auto;
`;

const GridHeader = styled.div`
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 2px solid #e2e8f0;
  z-index: 10;
`;

const CornerCell = styled.div`
  padding: 1rem;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
`;

const DiaHeader = styled.div`
  padding: 1rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  border-right: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DiaLabel = styled.span`
  flex: 1;
`;

const DuplicarButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const GridBody = styled.div``;

const FilaHorario = styled.div`
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const CeldaHora = styled.div`
  padding: 1rem;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const HoraTexto = styled.span`
  font-weight: ${p => p.small ? '400' : '600'};
  color: ${p => p.small ? '#64748b' : '#1e293b'};
  font-size: ${p => p.small ? '0.75rem' : '0.9rem'};
`;

const CeldaClase = styled.div`
  padding: 0.75rem;
  border-right: 1px solid #e2e8f0;
  min-height: 80px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: ${p => {
    if (p.$esCopiada) return '#eff6ff';
    if (p.$isSeleccionada) return '#fef3c7';
    if (p.$tieneClase) return '#f0fdf4';
    return 'white';
  }};
  border: ${p => {
    if (p.$esCopiada) return '2px dashed #3b82f6';
    if (p.$isSeleccionada) return '2px solid #f59e0b';
    return 'none';
  }};

  &:hover {
    background: ${p => p.$tieneClase ? '#dcfce7' : '#f1f5f9'};
  }
`;

const ClaseInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ClaseNombre = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem;
  line-height: 1.2;
`;

const ClaseDocente = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ClaseAcciones = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const IconButton = styled.button`
  background: ${p => p.$danger ? '#fee' : '#f1f5f9'};
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  color: ${p => p.$danger ? '#c33' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${p => p.$danger ? '#fcc' : '#e2e8f0'};
  }
`;

const CeldaVacia = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #cbd5e1;
`;

const FormularioLateral = styled.div`
  width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
`;

const FormHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FormTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const CloseFormButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;

  &:hover {
    background: #f1f5f9;
  }
`;

const FormBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const BlockRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BlockSelect = styled.select`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const InfoBox = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-top: 1rem;
`;

const FormFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
`;

const ButtonSecondary = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const ButtonPrimary = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const EstadisticasFooter = styled.div`
  background: white;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 2rem;
`;

const Estadistica = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const EstadisticaIcono = styled.div`
  width: 48px;
  height: 48px;
  background: ${p => p.$color}22;
  color: ${p => p.$color};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EstadisticaInfo = styled.div``;

const EstadisticaValor = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
`;

const EstadisticaLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #64748b;
  font-size: 1.1rem;
`;

export default ConfigurarHorarioNuevo;