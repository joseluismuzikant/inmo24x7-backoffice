# Inmo24x7 Backoffice

Backoffice moderno para la gestión de leads y configuración del agente IA inmo24x7.

![Dashboard Screenshot](screenshot.png)

## 🚀 Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Supabase Auth** - Autenticación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```
inmo24x7-backoffice/
├── src/
│   ├── assets/              # Recursos estáticos
│   ├── components/          # Componentes reutilizables
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx
│   │   └── ChatSimulator.jsx
│   ├── pages/               # Páginas principales
│   │   ├── Dashboard.jsx
│   │   └── Login.jsx
│   ├── services/            # Servicios de API
│   │   ├── supabaseClient.js
│   │   └── api.js
│   ├── App.jsx              # Router y rutas
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globales
├── .env                     # Variables de entorno
├── tailwind.config.js       # Configuración Tailwind
└── package.json
```

## ⚙️ Configuración

1. **Clonar y instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Copia el archivo `.env` y completa tus credenciales:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_USE_SUPABASE_AUTH=false  # "true" para habilitar auth, "false" para deshabilitar
VITE_API_URL=http://localhost:3000
```

### 🔐 Autenticación Configurable

La autenticación con Supabase puede habilitarse/deshabilitarse mediante la variable `VITE_USE_SUPABASE_AUTH`:

- **`VITE_USE_SUPABASE_AUTH=false`** (default): Acceso libre sin login. Las rutas protegidas están abiertas.
- **`VITE_USE_SUPABASE_AUTH=true`**: Requiere login con Supabase Auth para acceder al dashboard.

3. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

## 🎨 Paleta de Colores

- **Brand Blue:** `#1E3A8A` - Color principal
- **Brand Green:** `#10B981` - Acentos y éxito

## 🔐 Autenticación

El sistema usa Supabase Auth con las siguientes características:
- Login con email y contraseña
- Rutas protegidas
- Persistencia de sesión
- Logout

## 📊 Funcionalidades

### Dashboard
- **Gestión de Leads:** Tabla con listado, filtros y eliminación
- **Base de Conocimiento:** Drag & drop de archivos Excel/JSON
- **Configuración de Notificaciones:** Toggles para WhatsApp, Email y Calendar
- **Simulador de Chat:** Panel lateral para probar el agente IA

### Endpoints API

```
GET    /api/leads          # Listar leads
DELETE /api/leads/:id      # Eliminar lead
POST   /message            # Enviar mensaje al bot
```

## 🛠️ Comandos

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build de producción
npm run lint     # Ejecutar linter
```

## 📄 Licencia

Proyecto privado - Inmo24x7
