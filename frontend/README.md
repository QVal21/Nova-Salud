# Nova Salud — Frontend

Sistema web de gestión de inventario y ventas para la botica Nova Salud.
Trabajo final del curso Fullstack Developer Software (SENATI).

## Tecnologías

- React 18 + Vite
- Tailwind CSS 4
- React Router
- Recharts (gráficos)
- Lucide (íconos)

## Cómo ejecutarlo

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. En esta etapa (maqueta) cualquier usuario y una contraseña de 6 o más caracteres permiten entrar; el rol se elige en el login.

## Estructura

```
src/
  components/   Sidebar, Topbar
  config/       nav.js (menú y permisos por rol)
  context/      AuthContext (sesión)
  data/         mock.js (datos de prueba, se reemplazan por la API)
  layouts/      AppLayout (menú + barra superior + contenido)
  pages/        Login, Dashboard, Placeholder
```
