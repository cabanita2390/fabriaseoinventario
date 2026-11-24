# Sistema de Inventario para Manufactura

Sistema web de inventario para una empresa de manufactura. Controla materias primas, envases, etiquetas y producto terminado por bodega, con movimientos de entrada y salida, y un dashboard de indicadores.

Proyecto desarrollado en equipo de 3 personas (mayo a septiembre de 2025).
**Mi rol:** desarrollo del backend (arquitectura de módulos, autenticación y roles, endpoints de inventario, movimientos y dashboard, seeders y pruebas).

## Stack

| Capa | Tecnologías |
| --- | --- |
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL |
| Seguridad | JWT con Passport, bcrypt, guards y decorador `@Roles` |
| Validación | class-validator, class-transformer (DTOs) |
| Pruebas | Jest (pruebas de controladores, integración y e2e) |
| Frontend | React, TypeScript, React Router, Axios, Chart.js |

## Arquitectura del backend

```
backend/src
├── auth/            # login JWT, estrategia Passport, guards y decorador de roles
├── usuario/ rol/    # gestión de usuarios y roles
├── producto/ presentacion/ unidadmedida/ proveedor/
├── bodega/          # bodegas por tipo de material
├── inventario/      # stock por bodega y producto
├── movimiento/      # entradas y salidas que actualizan el inventario
├── dashboard/       # indicadores para la vista principal
├── seed/            # datos iniciales (roles, usuario admin, catálogos)
└── entities/        # entidades TypeORM
```

## Control de acceso por roles

7 roles con permisos por endpoint mediante `JwtAuthGuard` + `RolesGuard`:

`ADMIN`, `LIDER_PRODUCCION`, `OPERARIO_PRODUCCION`, `RECEPTOR_MP`, `RECEPTOR_ENVASE`, `RECEPTOR_ETIQUETAS` y `USUARIO`.

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN, LIDER_PRODUCCION)
@Post()
create(@Body() dto: CreateMovimientoDto) { ... }
```

## Cómo correrlo

```bash
# Backend
cd backend
npm install
cp .env.example .env   # configurar la conexión a PostgreSQL
npm run start:dev
npm test

# Frontend
cd frontend
npm install
npm start
```

## Equipo

- Felipe Cabana: backend
- Ana Milena Vásquez Tovar y @migueacastro1: frontend
