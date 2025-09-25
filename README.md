
# asistencias-app

Aplicación web para la gestión de asistencias de estudiantes, desarrollada con Vue 3, Vite, Pinia, Vue Router y Supabase.

## Características principales

- Inicio de sesión de usuarios (con Supabase)
- Gestión de grupos y estudiantes
- Registro y visualización de asistencias
- **Altas de grupos y alumnos** desde la propia app
- Exportación de datos
- Interfaz moderna y responsiva

## Altas de grupos y alumnos

Desde el dashboard puedes acceder al apartado **Altas**:

- **Alta grupo:** Permite crear un nuevo grupo indicando solo el nombre.
- **Alta alumno:** Permite crear un alumno, asociarlo a un grupo existente y registrar sus datos básicos.

Ambos formularios muestran mensajes de éxito o error tras cada alta.

## Estructura del proyecto

- `src/componentes/`: Componentes reutilizables (botones, formularios, filas de estudiantes, altas, etc.)
- `src/vistas/`: Vistas principales (Dashboard, Login, Export, Group, Altas)
- `src/lib/supabase.ts`: Configuración de Supabase
- `src/stores/`: Estado global con Pinia
- `src/router/`: Rutas de la aplicación

## Instalación

```sh
npm install
```

## Scripts útiles

- **Desarrollo:** `npm run dev`
- **Build producción:** `npm run build`
- **Previsualización:** `npm run preview`
- **Tests unitarios:** `npm run test:unit`
- **Lint:** `npm run lint`
- **Chequeo de tipos:** `npm run type-check`

## Tecnologías principales

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Supabase](https://supabase.com/)
- [Vitest](https://vitest.dev/)

## Notas

- Requiere Node.js 20.19.0 o superior.
- Configura tus credenciales de Supabase en `src/lib/supabase.ts`.
