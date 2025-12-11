using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class GrupoCursoService : IGrupoCursoService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<GrupoCursoService> _logger;

        public GrupoCursoService(EduCoreDbContext context, ILogger<GrupoCursoService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetAllAsync()
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Periodo)
                .Include(g => g.Aula)
                .Where(g => g.Activo)
                .OrderBy(g => g.Grado)
                .ThenBy(g => g.Seccion)
                .ThenBy(g => g.Curso.Nombre)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<GrupoCursoDto?> GetByIdAsync(int id)
        {
            var grupo = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Periodo) // ← AGREGADO
                .Include(g => g.Aula)
                .FirstOrDefaultAsync(g => g.Id == id);

            return grupo != null ? MapToDto(grupo) : null;
        }

        public async Task<GrupoCursoDetalleDto?> GetDetalleByIdAsync(int id)
        {
            var grupo = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Periodo) // ← AGREGADO
                .Include(g => g.Aula)
                .Include(g => g.Inscripciones)
                    .ThenInclude(i => i.Estudiante)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grupo == null)
                return null;

            return new GrupoCursoDetalleDto
            {
                Id = grupo.Id,
                Codigo = grupo.Codigo,
                Curso = new CursoDto
                {
                    Id = grupo.Curso.Id,
                    Codigo = grupo.Curso.Codigo,
                    Nombre = grupo.Curso.Nombre,
                    Descripcion = grupo.Curso.Descripcion,
                    NivelGrado = grupo.Curso.NivelGrado,
                    Nivel = grupo.Curso.Nivel,
                    AreaConocimiento = grupo.Curso.AreaConocimiento,
                    HorasSemana = grupo.Curso.HorasSemana,
                    EsObligatoria = grupo.Curso.EsObligatoria,
                    Orden = grupo.Curso.Orden,
                    Activo = grupo.Curso.Activo
                },
                Docente = new DocenteDto
                {
                    Id = grupo.Docente.Id,
                    Codigo = grupo.Docente.Codigo,
                    Nombres = grupo.Docente.Nombres,
                    Apellidos = grupo.Docente.Apellidos,
                    NombreCompleto = $"{grupo.Docente.Nombres} {grupo.Docente.Apellidos}",
                    Email = grupo.Docente.Email,
                    Telefono = grupo.Docente.Telefono,
                    Especialidad = grupo.Docente.Especialidad,
                    FechaContratacion = grupo.Docente.FechaContratacion,
                    Activo = grupo.Docente.Activo
                },
                Grado = grupo.Grado,
                Seccion = grupo.Seccion,
                Anio = grupo.Anio,
                Periodo = grupo.Periodo?.Nombre ?? string.Empty, // ← PROTECCIÓN AGREGADA
                AulaId = grupo.AulaId,
                AulaFisica = grupo.Aula?.AulaFisica,
                Horario = grupo.Horario,
                CapacidadMaxima = grupo.CapacidadMaxima,
                CantidadEstudiantes = grupo.CantidadEstudiantes,
                Activo = grupo.Activo,
                Estudiantes = grupo.Inscripciones
                    .Where(i => i.Activo)
                    .Select(i => new EstudianteGrupoDto
                    {
                        EstudianteId = i.Estudiante.Id,
                        Matricula = i.Estudiante.Matricula,
                        NombreCompleto = $"{i.Estudiante.Nombres} {i.Estudiante.Apellidos}",
                        Email = i.Estudiante.Email,
                        FechaInscripcion = i.FechaInscripcion,
                        Estado = i.Estado
                    }).ToList()
            };
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetByPeriodoAsync(string periodo)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Periodo) // ← AGREGADO
                .Include(g => g.Aula)
                .Where(g => g.Periodo.Nombre == periodo && g.Activo)
                .OrderBy(g => g.Grado)
                .ThenBy(g => g.Seccion)
                .ThenBy(g => g.Curso.Nombre)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetByGradoSeccionAsync(int grado, string seccion, string periodo)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Periodo) // ← AGREGADO
                .Include(g => g.Aula)
                .Where(g => g.Grado == grado && g.Seccion == seccion && g.Periodo.Nombre == periodo && g.Activo)
                .OrderBy(g => g.Curso.Orden)
                .ThenBy(g => g.Curso.Nombre)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetByCursoAsync(int cursoId)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Periodo) // ← AGREGADO
                .Include(g => g.Aula)
                .Where(g => g.CursoId == cursoId && g.Activo)
                .OrderBy(g => g.Grado)
                .ThenBy(g => g.Seccion)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetByDocenteAsync(int docenteId)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Periodo) // ← AGREGADO
                .Include(g => g.Aula)
                .Where(g => g.DocenteId == docenteId && g.Activo)
                .OrderBy(g => g.Grado)
                .ThenBy(g => g.Seccion)
                .ThenBy(g => g.Curso.Nombre)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<GrupoCursoDto> CreateAsync(CreateGrupoCursoDto createDto)
        {
            var grupo = new GrupoCurso
            {
                Codigo = createDto.Codigo,
                CursoId = createDto.CursoId,
                DocenteId = createDto.DocenteId,
                Grado = createDto.Grado,
                Seccion = createDto.Seccion,
                Anio = createDto.Anio,
                PeriodoId = createDto.PeriodoId,
                AulaId = createDto.AulaId,
                Horario = createDto.Horario,
                CapacidadMaxima = createDto.CapacidadMaxima,
                CantidadEstudiantes = 0,
                Activo = true
            };

            _context.GruposCursos.Add(grupo);
            await _context.SaveChangesAsync();

            // Recargar con las relaciones
            await _context.Entry(grupo)
                .Reference(g => g.Curso)
                .LoadAsync();
            await _context.Entry(grupo)
                .Reference(g => g.Docente)
                .LoadAsync();
            await _context.Entry(grupo)
                .Reference(g => g.Periodo)
                .LoadAsync(); // ← AGREGADO
            if (grupo.AulaId.HasValue)
            {
                await _context.Entry(grupo)
                    .Reference(g => g.Aula)
                    .LoadAsync();
            }

            _logger.LogInformation(
                "Grupo creado: {Codigo} - Curso: {Curso}, Grado: {Grado}, Seccion: {Seccion}",
                grupo.Codigo, grupo.Curso.Nombre, grupo.Grado, grupo.Seccion
            );

            return MapToDto(grupo);
        }

        public async Task<GrupoCursoDto?> UpdateAsync(int id, UpdateGrupoCursoDto updateDto)
        {
            var grupo = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Periodo) // ← AGREGADO
                .Include(g => g.Aula)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grupo == null)
                return null;

            grupo.DocenteId = updateDto.DocenteId;
            grupo.AulaId = updateDto.AulaId;
            grupo.Horario = updateDto.Horario;
            grupo.CapacidadMaxima = updateDto.CapacidadMaxima;
            grupo.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            // Recargar docente si cambió
            await _context.Entry(grupo)
                .Reference(g => g.Docente)
                .LoadAsync();

            // Recargar aula si cambió
            if (grupo.AulaId.HasValue)
            {
                await _context.Entry(grupo)
                    .Reference(g => g.Aula)
                    .LoadAsync();
            }

            _logger.LogInformation("Grupo actualizado: {Id} - {Codigo}", id, grupo.Codigo);

            return MapToDto(grupo);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var grupo = await _context.GruposCursos.FindAsync(id);

            if (grupo == null)
                return false;

            // Verificar si tiene estudiantes inscritos
            var tieneEstudiantes = await _context.Inscripciones
                .AnyAsync(i => i.GrupoCursoId == id && i.Activo);

            if (tieneEstudiantes)
            {
                _logger.LogWarning(
                    "No se puede eliminar el grupo {Id} porque tiene estudiantes inscritos",
                    id
                );
                return false;
            }

            // Soft delete
            grupo.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Grupo eliminado (soft delete): {Id} - {Codigo}", id, grupo.Codigo);

            return true;
        }

        public async Task<HorarioGradoDto?> GetHorarioByGradoSeccionAsync(
            int grado,
            string seccion,
            string periodo)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Periodo) // ← AGREGADO
                .Include(g => g.Aula)
                .Where(g => g.Grado == grado && g.Seccion == seccion && g.Periodo.Nombre == periodo && g.Activo)
                .OrderBy(g => g.Curso.Orden)
                .ThenBy(g => g.Horario)
                .ToListAsync();

            if (!grupos.Any())
                return null;

            return new HorarioGradoDto
            {
                Periodo = periodo,
                Grado = grado,
                Seccion = seccion,
                Grupos = grupos.Select(g => new GrupoCursoHorarioDto
                {
                    GrupoId = g.Id,
                    CodigoGrupo = g.Codigo,
                    CodigoCurso = g.Curso.Codigo,
                    NombreCurso = g.Curso.Nombre,
                    AreaConocimiento = g.Curso.AreaConocimiento,
                    Docente = $"{g.Docente.Nombres} {g.Docente.Apellidos}",
                    AulaId = g.AulaId,
                    AulaFisica = g.Aula?.AulaFisica,
                    Horario = g.Horario
                }).ToList()
            };
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.GruposCursos.AnyAsync(g => g.Id == id);
        }

        public async Task<bool> CodigoExistsAsync(string codigo)
        {
            return await _context.GruposCursos.AnyAsync(g => g.Codigo == codigo);
        }

        public async Task<BatchCreateResultDto> CreateBatchAsync(CreateGruposCursosBatchDto batchDto)
        {
            var result = new BatchCreateResultDto();

            // Validar que el aula exista y obtener sus datos
            var aula = await _context.Aulas
                .Include(a => a.Periodo)
                .FirstOrDefaultAsync(a => a.Id == batchDto.AulaId && a.Activo);

            if (aula == null)
            {
                throw new InvalidOperationException("El aula especificada no existe o está inactiva");
            }

            // Validar que el período exista
            var periodo = await _context.Periodos
                .FirstOrDefaultAsync(p => p.Id == batchDto.PeriodoId && p.Activo);

            if (periodo == null)
            {
                throw new InvalidOperationException("El período especificado no existe o está inactivo");
            }

            // Validar que el docente exista
            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.Id == batchDto.DocenteId && d.Activo);

            if (docente == null)
            {
                throw new InvalidOperationException("El docente especificado no existe o está inactivo");
            }

            // Obtener todos los cursos solicitados
            var cursosIds = batchDto.Cursos.Select(c => c.CursoId).ToList();
            var cursos = await _context.Cursos
                .Where(c => cursosIds.Contains(c.Id) && c.Activo)
                .ToListAsync();

            // Validar que todos los cursos correspondan al grado del aula
            var cursosInvalidos = cursos
                .Where(c => c.NivelGrado != aula.Grado)
                .ToList();

            if (cursosInvalidos.Any())
            {
                foreach (var curso in cursosInvalidos)
                {
                    result.Errores.Add(new BatchErrorDto
                    {
                        CursoId = curso.Id,
                        NombreCurso = curso.Nombre,
                        Mensaje = $"El curso es de grado {curso.NivelGrado}° pero el aula es de {aula.Grado}°"
                    });
                    result.TotalFallidos++;
                }
            }

            // Usar transacción para crear todos los grupos
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                foreach (var cursoItem in batchDto.Cursos)
                {
                    var curso = cursos.FirstOrDefault(c => c.Id == cursoItem.CursoId);

                    if (curso == null)
                    {
                        result.Errores.Add(new BatchErrorDto
                        {
                            CursoId = cursoItem.CursoId,
                            NombreCurso = "Curso no encontrado",
                            Mensaje = "El curso no existe o está inactivo"
                        });
                        result.TotalFallidos++;
                        continue;
                    }

                    // Validar grado del curso
                    if (curso.NivelGrado != aula.Grado)
                    {
                        continue; // Ya se agregó al error anteriormente
                    }

                    // Generar código automático
                    var codigo = $"{aula.Grado}{aula.Seccion.ToUpper()}-{curso.Codigo}";

                    // Verificar si ya existe
                    if (await _context.GruposCursos.AnyAsync(g => g.Codigo == codigo && g.Activo))
                    {
                        result.Errores.Add(new BatchErrorDto
                        {
                            CursoId = curso.Id,
                            NombreCurso = curso.Nombre,
                            Mensaje = $"Ya existe un grupo con el código {codigo}"
                        });
                        result.TotalFallidos++;
                        continue;
                    }

                    // Crear el grupo
                    var grupo = new GrupoCurso
                    {
                        Codigo = codigo,
                        CursoId = curso.Id,
                        DocenteId = batchDto.DocenteId,
                        Grado = aula.Grado,
                        Seccion = aula.Seccion,
                        Anio = aula.Anio,
                        PeriodoId = batchDto.PeriodoId,
                        AulaId = batchDto.AulaId,
                        Horario = cursoItem.Horario?.Trim(),
                        CapacidadMaxima = aula.CapacidadMaxima,
                        CantidadEstudiantes = 0,
                        Activo = true
                    };

                    _context.GruposCursos.Add(grupo);
                    await _context.SaveChangesAsync();

                    // Cargar las relaciones para el DTO
                    await _context.Entry(grupo).Reference(g => g.Curso).LoadAsync();
                    await _context.Entry(grupo).Reference(g => g.Docente).LoadAsync();
                    await _context.Entry(grupo).Reference(g => g.Periodo).LoadAsync();
                    await _context.Entry(grupo).Reference(g => g.Aula).LoadAsync();

                    result.GruposCreados.Add(MapToDto(grupo));
                    result.TotalCreados++;

                    _logger.LogInformation(
                        "Grupo creado en batch: {Codigo} - Docente: {Docente}",
                        grupo.Codigo,
                        $"{docente.Nombres} {docente.Apellidos}"
                    );
                }

                await transaction.CommitAsync();

                _logger.LogInformation(
                    "Creación masiva completada: {TotalCreados} grupos creados, {TotalFallidos} fallidos",
                    result.TotalCreados,
                    result.TotalFallidos
                );

                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error en la creación masiva de grupos");
                throw;
            }
        }

        private GrupoCursoDto MapToDto(GrupoCurso grupo)
        {
            return new GrupoCursoDto
            {
                Id = grupo.Id,
                Codigo = grupo.Codigo,
                CursoId = grupo.CursoId,
                CodigoCurso = grupo.Curso?.Codigo ?? string.Empty,
                NombreCurso = grupo.Curso?.Nombre ?? string.Empty,
                DocenteId = grupo.DocenteId,
                CodigoDocente = grupo.Docente?.Codigo ?? string.Empty,
                NombreDocente = grupo.Docente != null
                    ? $"{grupo.Docente.Nombres} {grupo.Docente.Apellidos}"
                    : string.Empty,
                Grado = grupo.Grado,
                Seccion = grupo.Seccion,
                Anio = grupo.Anio,
                Periodo = grupo.Periodo?.Nombre ?? string.Empty,
                AulaId = grupo.AulaId,
                AulaFisica = grupo.Aula?.AulaFisica,
                Horario = grupo.Horario,
                CapacidadMaxima = grupo.CapacidadMaxima,
                CantidadEstudiantes = grupo.CantidadEstudiantes,
                Activo = grupo.Activo
            };
        }
    }
}