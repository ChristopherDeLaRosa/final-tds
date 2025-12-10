# 🎓 Zirak - Sistema de Gestión Académica

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791)

Sistema integral de gestión académica diseñado específicamente para instituciones educativas en la República Dominicana.

---

## 📋 Descripción del Proyecto

**Zirak** es una aplicación web full-stack que automatiza y centraliza todos los procesos administrativos y académicos de un centro educativo. Desde la matrícula de estudiantes hasta el seguimiento de calificaciones y asistencias, Zirak ofrece una solución completa, moderna y escalable para la gestión educativa.

El proyecto está construido con tecnologías de última generación: un backend robusto en ASP.NET Core con arquitectura limpia, conectado a PostgreSQL, y un frontend intuitivo en React 19 con arquitectura Atomic Design. Incluye autenticación JWT, integración con IA mediante Groq para consultas en lenguaje natural, y un diseño modular que facilita futuras expansiones.

---

## 🎯 Alcance del Proyecto

Zirak abarca la gestión completa del ciclo académico:

### Gestión Académica
- ✅ Administración de estudiantes, docentes, aulas y períodos escolares
- ✅ Gestión de cursos, grupos y asignación de horarios
- ✅ Control de inscripciones con soporte para matriculación masiva (Excel)
- ✅ Configuración automática de horarios con detección de conflictos

### Control Académico
- ✅ Gestión de sesiones de clase con pase de lista digital
- ✅ Seguimiento detallado de asistencias con reportes automatizados
- ✅ Sistema de calificaciones con rubros personalizables
- ✅ Gradebook interactivo para visualización de notas
- ✅ Generación automática de boletines académicos

### Características Adicionales
- ✅ Dashboard con métricas en tiempo real
- ✅ ChatWidget inteligente con IA para consultas rápidas
- ✅ Sistema de reportes y estadísticas avanzadas
- ✅ Gestión de usuarios con roles y permisos
- ✅ Soporte para múltiples períodos académicos simultáneos

---

## 🏗️ Arquitectura

### Backend

```
EduCore.API/
├── Configuration/          # Configuración JWT y settings
├── Controllers/           # Endpoints de la API REST
├── Data/                 # DbContext y migraciones
├── DTOs/                 # Data Transfer Objects
├── Models/               # Entidades del dominio
└── Services/
    ├── Interfaces/       # Contratos de servicios
    └── Implementations/  # Lógica de negocio
```

**Tecnologías Backend:**
- ASP.NET Core 8.0
- Entity Framework Core
- PostgreSQL 16
- JWT Bearer Authentication
- Swagger/OpenAPI
- Groq AI Integration

**Patrón de Arquitectura:**
- Clean Architecture
- Repository Pattern
- Dependency Injection
- SOLID Principles

### Frontend

```
frontend/
├── src/
│   ├── components/           # Atomic Design
│   │   ├── atoms/           # Componentes básicos
│   │   ├── molecules/       # Combinaciones simples
│   │   └── organisms/       # Secciones complejas
│   ├── pages/               # 15+ páginas principales
│   ├── routes/              # React Router + ProtectedRoute
│   ├── services/            # API clients (13+ servicios)
│   ├── templates/           # Layouts
│   ├── hooks/               # Custom React hooks
│   ├── styles/              # Global styles
│   └── utils/               # Funciones helper
```

**Tecnologías Frontend:**
- React 19.1.1
- Vite (Rolldown)
- React Router 7
- Styled Components
- TanStack Query (React Query)
- React Hook Form + Yup
- Axios
- SweetAlert2
- Recharts
- Lucide Icons
- XLSX

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 16+](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/)

### Backend Setup

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tuusuario/zirak.git
   cd zirak/EduCore.API
   ```

2. **Configurar la base de datos**
   
   Editar `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=zirakdb;Username=tu_usuario;Password=tu_password"
     },
     "JwtSettings": {
       "Secret": "tu_clave_secreta_super_segura_de_al_menos_32_caracteres",
       "Issuer": "EduCoreAPI",
       "Audience": "EduCoreClient",
       "ExpirationMinutes": 60
     },
     "Groq": {
       "ApiKey": "tu_api_key_de_groq"
     }
   }
   ```

3. **Crear la base de datos**
   ```bash
   dotnet ef database update
   ```

4. **Ejecutar el backend**
   ```bash
   dotnet run
   ```
   
   La API estará disponible en: `https://localhost:7185`

### Frontend Setup

1. **Navegar al directorio del frontend**
   ```bash
   cd ../frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env`:
   ```env
   VITE_API_BASE_URL=https://localhost:7185/api
   ```

4. **Ejecutar el frontend**
   ```bash
   npm run dev
   ```
   
   La aplicación estará disponible en: `http://localhost:5173`

---

## 🔐 Credenciales por Defecto

Después de ejecutar las migraciones, puedes usar estas credenciales de prueba:

```
Usuario: admin@educore.com
Contraseña: Admin123!
```

> ⚠️ **IMPORTANTE:** Cambia estas credenciales en producción.

---

## 📚 Documentación de la API

Una vez que el backend esté ejecutándose, puedes acceder a la documentación interactiva de Swagger en:

```
https://localhost:7185/swagger
```

### Endpoints Principales

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

#### Gestión Académica
- `GET/POST/PUT/DELETE /api/estudiantes` - Estudiantes
- `GET/POST/PUT/DELETE /api/docentes` - Docentes
- `GET/POST/PUT/DELETE /api/cursos` - Cursos
- `GET/POST/PUT/DELETE /api/aulas` - Aulas
- `GET/POST/PUT/DELETE /api/periodos` - Períodos

#### Operaciones
- `POST /api/aulas/{id}/inscribir-masivo` - Inscripción masiva
- `GET/POST /api/asistencias` - Gestión de asistencias
- `GET/POST /api/calificaciones` - Gestión de calificaciones
- `GET /api/reportes/*` - Reportes y estadísticas

#### IA
- `POST /api/ai/ask` - Consultas con IA

---

## 🧪 Testing

### Backend
```bash
cd EduCore.API
dotnet test
```

### Frontend
```bash
cd frontend
npm run test
```

---

## 📦 Build para Producción

### Backend
```bash
cd EduCore.API
dotnet publish -c Release -o ./publish
```

### Frontend
```bash
cd frontend
npm run build
```

Los archivos optimizados estarán en `frontend/dist/`

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Estilo

- **Backend:** Seguir las convenciones de C# y .NET
- **Frontend:** Usar ESLint y Prettier (configurados en el proyecto)
- **Commits:** Usar [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un [issue](https://github.com/tuusuario/zirak/issues) con:

- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs. actual
- Screenshots (si aplica)
- Información del entorno (OS, versiones, etc.)

---

## 📝 Roadmap

### v2.0 (Planificado)
- [ ] Módulo de pagos y finanzas
- [ ] Sistema de mensajería interno
- [ ] App móvil (React Native)
- [ ] Notificaciones push
- [ ] Integración con plataformas de videoconferencia
- [ ] Dashboard de análisis con BI
- [ ] Exportación avanzada de reportes (PDF, Excel)
- [ ] Multi-tenant architecture

### v1.5 (En desarrollo)
- [ ] Mejoras en el sistema de permisos
- [ ] Optimización de queries
- [ ] Tests de integración completos
- [ ] Documentación técnica completa

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [GitHub](https://github.com/tuusuario)

---

## 🙏 Agradecimientos

- Instituciones educativas dominicanas que inspiraron este proyecto
- Comunidad de .NET y React
- Todos los contribuidores y testers

---

## 📞 Contacto

- **Email:** contacto@zirak.com
- **Website:** [zirak.com](https://zirak.com)
- **LinkedIn:** [Tu LinkedIn](https://linkedin.com/in/tuusuario)

---

## 🌟 Dale una estrella

Si este proyecto te resulta útil, ¡considera darle una estrella ⭐ en GitHub!

---

**Hecho con ❤️ en República Dominicana 🇩🇴**
