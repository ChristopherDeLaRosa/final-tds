using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class GruposCursos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FechaCreacion", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 21, 1, 47, 28, 537, DateTimeKind.Utc).AddTicks(788), "$2a$11$FYuuWF.g0kV1evlLWk5FQ.0Ont0alv8wWC/fI9mX4hflxNM0aLOCS" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FechaCreacion", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 21, 1, 36, 53, 720, DateTimeKind.Utc).AddTicks(5818), "$2a$11$rxhwv7kl3aCEGU/j34j9re.5.l429z6hJDpUrrUuTG9/7Va6WHaAi" });
        }
    }
}
