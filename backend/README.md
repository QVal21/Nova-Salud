# Nova Salud — Backend (API REST)

API de inventario y ventas para la botica Nova Salud.
Node.js + Express + MongoDB (Mongoose), arquitectura por capas: **routes → controllers → services → models**.

## Puesta en marcha

```bash
cd backend
npm install
cp .env.example .env     # en Windows: copy .env.example .env
# edita .env y pega tu cadena de MongoDB Atlas y un JWT_SECRET
npm run seed             # carga datos de prueba (BORRA la base)
npm run dev              # http://localhost:4000/api
```

Usuarios de prueba: `admin / admin123` (administrador) y `ana.torres / vendedor123` (vendedor).

## Estructura

```
server.js                 arranque: lee .env, conecta a MongoDB y levanta Express
seed.js                   datos de prueba
src/
  app.js                  middlewares globales (helmet, cors, json) y rutas
  config/db.js            conexión a MongoDB
  routes/index.js         endpoints y permisos por rol
  controllers/            reciben la petición y devuelven la respuesta
  services/               reglas de negocio y validaciones
  models/                 esquemas de Mongoose
  middlewares/            auth (JWT y roles) y manejo de errores
  utils/                  validación, fechas en hora de Lima, errores
docs/                     colección para Thunder Client / Postman
```

## Endpoints

Todas las rutas, excepto login y health, requieren `Authorization: Bearer <token>`.

| Método | Ruta | Rol | Descripción |
| --- | --- | --- | --- |
| GET | /api/health | público | Estado del servicio |
| POST | /api/auth/login | público | Devuelve token JWT (máx. 10 intentos / 15 min) |
| GET | /api/auth/perfil | todos | Usuario de la sesión |
| GET | /api/productos?q=&categoria= | todos | Listar y buscar |
| GET | /api/productos/categorias | todos | Categorías existentes |
| GET | /api/productos/:id | todos | Detalle |
| POST | /api/productos | admin | Crear (registra el stock inicial como entrada) |
| PUT | /api/productos/:id | admin | Editar (el stock no se edita aquí) |
| DELETE | /api/productos/:id | admin | Baja lógica |
| POST | /api/ventas | todos | Registrar venta: descuenta stock en transacción |
| GET | /api/ventas?q=&desde=&hasta= | todos | Historial |
| GET | /api/ventas/:id | todos | Detalle del comprobante |
| POST | /api/movimientos | todos (ajuste solo admin) | Entrada, salida o ajuste por conteo |
| GET | /api/movimientos?tipo=&productoId= | todos | Kardex |
| GET | /api/alertas | todos | Stock bajo y vencimientos (≤ 30 días) |
| GET | /api/pedidos | todos | Pedidos de reposición |
| POST | /api/pedidos | todos | Generar pedido desde una alerta |
| PATCH | /api/pedidos/:id/recibir | admin | Recibir pedido: suma stock |
| GET/POST | /api/clientes | todos | Listar con resumen de compras / crear |
| PUT | /api/clientes/:id | todos | Editar |
| GET | /api/clientes/:id/compras | todos | Historial del cliente |
| GET | /api/proveedores | todos | Listar |
| POST/PUT | /api/proveedores | admin | Crear / editar |
| GET/POST | /api/usuarios | admin | Listar / crear |
| PATCH | /api/usuarios/:id | admin | Cambiar rol, estado o clave |
| GET | /api/reportes/resumen | todos | Datos del panel |
| GET | /api/reportes/indicadores | admin | Métricas de efectividad (30 días) |

## Seguridad

- Contraseñas cifradas con bcrypt; nunca se devuelven en las respuestas.
- Sesión con JWT que expira en 8 horas (un turno).
- Permisos por rol en cada ruta (administrador y vendedor).
- Límite de intentos de login contra fuerza bruta.
- Cabeceras de seguridad con helmet y CORS restringido al frontend.
- Variables sensibles en `.env`, fuera del repositorio.
- Los precios de la venta se leen de la base, no del cliente.

## Integridad del inventario

- Las ventas, movimientos y recepción de pedidos usan **transacciones**: si un producto no tiene stock suficiente, no se guarda nada.
- El descuento de stock lleva la condición `stock >= cantidad` en la misma operación, así dos ventas simultáneas no pueden dejar stock negativo.
- Cada cambio de stock genera un movimiento con usuario, fecha y motivo (kardex).
