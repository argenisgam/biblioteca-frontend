# Biblioteca · Frontend

Aplicación independiente para gestionar el catálogo de libros, lectores y préstamos de `biblioteca-api`.

## Requisitos

- Node.js 18 o posterior
- El backend de biblioteca ejecutándose

## Puesta en marcha

1. En esta carpeta, instala las dependencias: `npm install`.
2. Copia `.env.example` como `.env` y ajusta `VITE_API_URL` si el API no está en `http://localhost:3000`.
3. Configura la API y crea la primera cuenta de administrador (ver `biblioteca-api/README.md`).
4. Ejecuta `npm run dev` y abre la dirección que indique Vite (normalmente `http://localhost:5173`).

Si el backend tiene CORS restringido mediante `HOST_ORIGIN`, configura esa variable en su `.env` con el origen de Vite, por ejemplo `http://localhost:5173`.

## Funciones

- Resumen con el catálogo, lectores, préstamos activos y devoluciones.
- Búsqueda, creación, edición y eliminación de libros y lectores. Al crear un lector, se registra también una cuenta de acceso con usuario y contraseña.
- Registro y devolución de préstamos. El selector excluye los libros que figuran prestados.
- URL de API configurable con `VITE_API_URL`.
- Inicio de sesión con JWT y navegación restringida por rol.
- Opción «Crear cuenta» desde el login. Las cuentas nuevas tienen permiso para consultar el catálogo.

El rol `Administrador` gestiona libros, lectores y préstamos. El rol `Usuario` solo puede consultar el catálogo. La API valida cada permiso independientemente de las restricciones visuales del cliente.
