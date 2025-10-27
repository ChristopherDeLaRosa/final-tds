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
                .Where(r => r.Activo)
                .OrderBy(r => r.SeccionId)
                .ThenBy(r => r.Orden)
                .ToListAsync();

            return rubros.Select(r => MapToDto(r));
        }

        public async Task<RubroDto?> GetByIdAsync(int id)
        {
            var rubro = await _context.Rubros
                .FirstOrDefaultAsync(r => r.Id == id);

            return rubro != null ? MapToDto(rubro) : null;
        }

        public async Task<IEnumerable<RubroDto>> GetBySeccionAsync(int seccionId)
        {
            var rubros = await _context.Rubros
                .Where(r => r.SeccionId == seccionId && r.Activo)
                .OrderBy(r => r.Orden)
                .ToListAsync();

            return rubros.Select(r => MapToDto(r));
        }

        public async Task<RubroDto> CreateAsync(CreateRubroDto createDto)
        {
            var rubro = new Rubro
            {
                SeccionId = createDto.SeccionId,
                Nombre = createDto.Nombre,
                Descripcion = createDto.Descripcion,
                Porcentaje = createDto.Porcentaje,
                Orden = createDto.Orden,
                Activo = true
            };

            _context.Rubros.Add(rubro);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Rubro creado: {Nombre} - Sección: {SeccionId}", rubro.Nombre, rubro.SeccionId);

            return MapToDto(rubro);
        }

        public async Task<RubroDto?> UpdateAsync(int id, UpdateRubroDto updateDto)
        {
            var rubro = await _context.Rubros.FindAsync(id);

            if (rubro == null)
                return null;

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
            var rubro = await _context.Rubros.FindAsync(id);

            if (rubro == null)
                return false;

            // Soft delete
            rubro.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Rubro eliminado (soft delete): {Id} - {Nombre}", id, rubro.Nombre);

            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Rubros.AnyAsync(r => r.Id == id);
        }

        public async Task<decimal> GetTotalPorcentajeBySeccionAsync(int seccionId)
        {
            var totalPorcentaje = await _context.Rubros
                .Where(r => r.SeccionId == seccionId && r.Activo)
                .SumAsync(r => r.Porcentaje);

            return totalPorcentaje;
        }

        private RubroDto MapToDto(Rubro rubro)
        {
            return new RubroDto
            {
                Id = rubro.Id,
                SeccionId = rubro.SeccionId,
                Nombre = rubro.Nombre,
                Descripcion = rubro.Descripcion,
                Porcentaje = rubro.Porcentaje,
                Orden = rubro.Orden,
                Activo = rubro.Activo
            };
        }
    }
}

