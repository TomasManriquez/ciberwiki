# Allware Wiki - Guía de Despliegue Local

## 🚀 Inicio Rápido

### Opción 1: Ejecutar todo desde la raíz (Recomendado)
```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará ambos servicios:
- **API Backend**: http://localhost:3000
- **Frontend Web**: http://localhost:4321

### Opción 2: Ejecutar servicios por separado

**Terminal 1 - Backend API:**
```bash
cd apps/api
npm run dev
```
Acceso: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```
Acceso: http://localhost:4321

## 📍 URLs del Proyecto

| Servicio | URL Local | Descripción |
|----------|-----------|-------------|
| Frontend | http://localhost:4321 | Interfaz de usuario (Astro) |
| API | http://localhost:3000 | Backend REST API (Hono) |
| API Docs | http://localhost:3000/ | Mensaje de estado de API |

## 🔧 Solución de Problemas

### Si no ves las URLs al ejecutar npm run dev:

1. **Verifica que las dependencias estén instaladas:**
   ```bash
   npm install
   ```

2. **Si los mensajes se mezclan**, ejecuta los servicios por separado (Opción 2).

3. **Verifica que los puertos no estén ocupados:**
   ```bash
   # En Windows/WSL
   netstat -ano | grep 3000
   netstat -ano | grep 4321
   ```

### Si hay errores de módulos no encontrados:

```bash
# Limpiar e instalar
rm -rf node_modules apps/*/node_modules package-lock.json apps/*/package-lock.json
npm install
```

## 🎯 Página Principal

Después de iniciar, abre tu navegador en:
**http://localhost:4321**

Esta es la página principal del frontend donde verás toda la interfaz de usuario.
