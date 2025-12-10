using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class RubroService : IRubroService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<RubroService> _logger;

        public RubroService(EduCoreDbContext context, ILogger<RubroService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<RubroDto>> GetAllAsync()
        {
            var rubros = await _context.Rubros
                .Include(r => r.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Where(r => r.Activo)
                .OrderBy(r => r.GrupoCurso.Codigo)
                .ThenBy(r => r.Orden)
                .ToListAsync();

            return rubros.Select(r => MapToDto(r));
        }

        public async Task<RubroDto?> GetByIdAsync(int id)
        {
            var rubro = await _context.Rubros
                .Include(r => r.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(r => r.Calificaciones)
                .FirstOrDefaultAsync(r => r.Id == id);

            return rubro != null ? MapToDto(rubro) : null;
        }

        public async Task<IEnumerable<RubroDto>> GetByGrupoCursoAsync(int grupoCursoId)
        {
            var rubros = await _context.Rubros
                .Include(r => r.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(r => r.Calificaciones)
                .Where(r => r.GrupoCursoId == grupoCursoId && r.Activo)
                .OrderBy(r => r.Orden)
                .ThenBy(r => r.Nombre)
                .ToListAsync();

            return rubros.Select(r => MapToDto(r));
        }

        public async Task<RubrosGrupoCursoDto?> GetRubrosGrupoCursoDetalleAsync(int grupoCursoId)
        {
            var grupoCurso = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Periodo)
                .FirstOrDefaultAsync(g => g.Id == grupoCursoId);

            if (grupoCurso == null)
                return null;

            var rubros = await _context.Rubros
                .Include(r => r.Calificaciones)
                .Where(r => r.GrupoCursoId == grupoCursoId && r.Activo)
                .OrderBy(r => r.Orden)
                .ToListAsync();

            // Obtener total de estudiantes inscritos
            var totalEstudiantes = await _context.Inscripciones
                .CountAsync(i => i.GrupoCursoId == grupoCursoId && i.Activo);

            var rubrosDetalle = new List<RubroDetalleDto>();
            decimal totalPorcentaje = 0;

            foreach (var rubro in rubros)
            {
                var calificaciones = rubro.Calificaciones.Where(c => !c.Recuperacion).ToList();
                var estudiantesConNota = calificaciones.Select(c => c.EstudianteId).Distinct().Count();
                var promedioRubro = calificaciones.Any()
                    ? Math.Round(calificaciones.Average(c => c.Nota), 2)
                    : (decimal?)null;

                rubrosDetalle.Add(new RubroDetalleDto
                {
                    Id = rubro.Id,
                    Nombre = rubro.Nombre,
                    Descripcion = rubro.Descripcion,
                    Porcentaje = rubro.Porcentaje,
                    Orden = rubro.Orden,
                    Activo = rubro.Activo,
                    TotalCalificaciones = calificaciones.Count,
                    EstudiantesConNota = estudiantesConNota,
                    EstudiantesSinNota = totalEstudiantes - estudiantesConNota,
                    PromedioRubro = promedioRubro
                });

                totalPorcentaje += rubro.Porcentaje;
            }

            return new RubrosGrupoCursoDto
            {
                GrupoCursoId = grupoCurso.Id,
                CodigoGrupo = grupoCurso.Codigo,
                NombreCurso = grupoCurso.Curso.Nombre,
                Grado = grupoCurso.Grado,
                Seccion = grupoCurso.Seccion,
                Periodo = grupoCurso.Periodo.Nombre,
                Rubros = rubrosDetalle,
                TotalPorcentaje = totalPorcentaje,
                PorcentajeCompleto = totalPorcentaje == 100
            };
        }

        public async Task<RubroDto> CreateAsync(CreateRubroDto createDto)
        {
            // Validar que el nombre no exista en el grupo
            if (await NombreExisteEnGrupoAsync(createDto.GrupoCursoId, createDto.Nombre))
            {
                throw new InvalidOperationException(
                    $"Ya existe un rubro con el nombre '{createDto.Nombre}' en este grupo"
                );
            }

            var rubro = new Rubro
            {
                GrupoCursoId = createDto.GrupoCursoId,
                Nombre = createDto.Nombre,
                Descripcion = createDto.Descripcion,
                Porcentaje = createDto.Porcentaje,
                Orden = createDto.Orden,
                Activo = true
            };

            _context.Rubros.Add(rubro);
            await _context.SaveChangesAsync();

            // Recargar con relaciones
            await _context.Entry(rubro)
                .Reference(r => r.GrupoCurso)
                .LoadAsync();
            await _context.Entry(rubro.GrupoCurso)
                .Reference(g => g.Curso)
                .LoadAsync();

            _logger.LogInformation(
                "Rubro creado: {Nombre} - GrupoCurso {GrupoCursoId} - Porcentaje: {Porcentaje}%",
                rubro.Nombre, rubro.GrupoCursoId, rubro.Porcentaje
            );

            return MapToDto(rubro);
        }

        public async Task<RubroDto?> UpdateAsync(int id, UpdateRubroDto updateDto)
        {
            var rubro = await _context.Rubros
                .Include(r => r.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rubro == null)
                return null;

            // Validar que el nombre no exista en el grupo (excepto este rubro)
            if (await NombreExisteEnGrupoAsync(rubro.GrupoCursoId, updateDto.Nombre, id))
            {
                throw new InvalidOperationException(
                    $"Ya existe un rubro con el nombre '{updateDto.Nombre}' en este grupo"
                );
            }

            rubro.Nombre = updateDto.Nombre;
            rubro.Descripcion = updateDto.Descripcion;
            rubro.Porcentaje = updateDto.Porcentaje;
            rubro.Orden = updateDto.Orden;
            rubro.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Rubro actualizado: {Id} - {Nombre}", id, rubro.Nombre);

            return MapToDto(rubro);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var rubro = await _context.Rubros
                .Include(r => r.Calificaciones)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rubro == null)
                return false;

            // Verificar si tiene calificaciones
            if (rubro.Calificaciones.Any())
            {
                _logger.LogWarning(
                    "No se puede eliminar el rubro {Id} porque tiene calificaciones registradas",
                    id
                );
                return false;
            }

            _context.Rubros.Remove(rubro);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Rubro eliminado: {Id} - {Nombre}", id, rubro.Nombre);

            return true;
        }

        public async Task<List<RubroDto>> CrearRubrosPlantillaAsync(CrearRubrosPlantillaDto plantillaDto)
        {
            // Validar que los porcentajes sumen 100%
            var totalPorcentaje = plantillaDto.Rubros.Sum(r => r.Porcentaje);
            if (totalPorcentaje != 100)
            {
                throw new InvalidOperationException(
                    $"Los porcentajes deben sumar 100%. Total actual: {totalPorcentaje}%"
                );
            }

            var rubrosCreados = new List<Rubro>();

            foreach (var rubroDto in plantillaDto.Rubros)
            {
                // Verificar que el nombre no exista
                if (await NombreExisteEnGrupoAsync(plantillaDto.GrupoCursoId, rubroDto.Nombre))
                {
                    _logger.LogWarning(
                        "Rubro '{Nombre}' ya existe en grupo {GrupoCursoId}, se omite",
                        rubroDto.Nombre, plantillaDto.GrupoCursoId
                    );
                    continue;
                }

                var rubro = new Rubro
                {
                    GrupoCursoId = plantillaDto.GrupoCursoId,
                    Nombre = rubroDto.Nombre,
                    Descripcion = rubroDto.Descripcion,
                    Porcentaje = rubroDto.Porcentaje,
                    Orden = rubroDto.Orden,
                    Activo = true
                };

                _context.Rubros.Add(rubro);
                rubrosCreados.Add(rubro);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Plantilla de rubros creada: {Cantidad} rubros en grupo {GrupoCursoId}",
                rubrosCreados.Count, plantillaDto.GrupoCursoId
            );

            // Recargar con relaciones
            foreach (var rubro in rubrosCreados)
            {
                await _context.Entry(rubro)
                    .Reference(r => r.GrupoCurso)
                    .LoadAsync();
                await _context.Entry(rubro.GrupoCurso)
                    .Reference(g => g.Curso)
                    .LoadAsync();
            }

            return rubrosCreados.Select(r => MapToDto(r)).ToList();
        }

        public async Task<ValidacionRubrosDto> ValidarPorcentajesAsync(int grupoCursoId)
        {
            var rubros = await _context.Rubros
                .Include(r => r.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Where(r => r.GrupoCursoId == grupoCursoId && r.Activo)
                .ToListAsync();

            var totalPorcentaje = rubros.Sum(r => r.Porcentaje);
            var esValido = totalPorcentaje == 100;

            string mensaje;
            if (esValido)
            {
                mensaje = "Los porcentajes de los rubros suman correctamente 100%";
            }
            else if (totalPorcentaje < 100)
            {
                mensaje = $"Faltan {100 - totalPorcentaje}% para completar el 100%";
            }
            else
            {
                mensaje = $"Los porcentajes exceden el 100% por {totalPorcentaje - 100}%";
            }

            return new ValidacionRubrosDto
            {
                GrupoCursoId = grupoCursoId,
                TotalPorcentaje = totalPorcentaje,
                EsValido = esValido,
                Mensaje = mensaje,
                Rubros = rubros.Select(r => MapToDto(r)).ToList()
            };
        }

        public async Task<bool> ReordenarRubrosAsync(int grupoCursoId, Dictionary<int, int> ordenamiento)
        {
            var rubros = await _context.Rubros
                .Where(r => r.GrupoCursoId == grupoCursoId && r.Activo)
                .ToListAsync();

            foreach (var rubro in rubros)
            {
                if (ordenamiento.TryGetValue(rubro.Id, out int nuevoOrden))
                {
                    rubro.Orden = nuevoOrden;
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Rubros reordenados en grupo {GrupoCursoId}", grupoCursoId);

            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Rubros.AnyAsync(r => r.Id == id);
        }

        public async Task<bool> NombreExisteEnGrupoAsync(int grupoCursoId, string nombre, int? rubroId = null)
        {
            var query = _context.Rubros
                .Where(r => r.GrupoCursoId == grupoCursoId &&
                           r.Nombre.ToLower() == nombre.ToLower() &&
                           r.Activo);

            if (rubroId.HasValue)
            {
                query = query.Where(r => r.Id != rubroId.Value);
            }

            return await query.AnyAsync();
        }

        private RubroDto MapToDto(Rubro rubro)
        {
            return new RubroDto
            {
                Id = rubro.Id,
                GrupoCursoId = rubro.GrupoCursoId,
                CodigoGrupo = rubro.GrupoCurso.Codigo,
                NombreCurso = rubro.GrupoCurso.Curso.Nombre,
                Nombre = rubro.Nombre,
                Descripcion = rubro.Descripcion,
                Porcentaje = rubro.Porcentaje,
                Orden = rubro.Orden,
                Activo = rubro.Activo,
                CantidadCalificaciones = rubro.Calificaciones?.Count ?? 0
            };
        }
    }
}
