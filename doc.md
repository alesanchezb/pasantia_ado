# Sistema de Gestión de Concursos y Evaluación Curricular - Documentación

**Versión:** 0.1.0 (MVP)  
**Organización:** Universidad de Sonora  
**Última actualización:** Marzo 2026

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura](#arquitectura)
4. [Features Implementadas](#features-implementadas)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Convenciones y Buenas Prácticas](#convenciones-y-buenas-prácticas)
7. [API Endpoints](#api-endpoints)
8. [Flujos Principales](#flujos-principales)
9. [Guía de Desarrollo](#guía-de-desarrollo)
10. [Roadmap](#roadmap)

---

## 🎯 Visión General

### Propósito
Desarrollar un sistema web institucional que centralice la gestión de concursos académicos y evaluación curricular del personal de la Universidad de Sonora, permitiendo:

- **Reutilización de información curricular** en múltiples convocatorias
- **Automatización de rúbricas** de evaluación conforme a EPA (Estatuto de Personal Académico)
- **Trazabilidad completa** del historial de evaluaciones
- **Reducción de carga administrativa** manual

### Usuarios Objetivo
- **Profesores Aspirantes (Applicants):** Registran y mantienen su perfil académico, postúlan a convocatorias, suben evidencias
- **Evaluadores:** Revisan expedientes, asignan puntajes, generan dictámenes
- **Administradores:** Gestionan convocatorias, usuarios, rúbricas y reportes

---

## 🛠 Stack Tecnológico

### Backend
| Componente | Tecnología | Versión | Propósito |
|------------|-----------|---------|----------|
| Framework Web | Django | 4.2+ | API REST y lógica de negocio |
| Servidor ASGI | Uvicorn | - | Servidor de aplicación |
| Base de Datos | SQLite (dev) / PostgreSQL (prod) | - | Persistencia de datos |
| API REST | Django REST Framework | Incluido en reqs | Serialización y validación |
| CORS | django-cors-headers | 4.3+ | Comunicación frontend-backend |

### Frontend
| Componente | Tecnología | Versión | Propósito |
|------------|-----------|---------|----------|
| Framework UI | React | 19.2+ | Interfaz de usuario |
| Build Tool | Vite | 7+ | Empaquetado y desarrollo |
| Routing | React Router DOM | 7.13+ | Navegación entre páginas |
| CSS Framework | Tailwind CSS | 3.4+ | Estilos y componentes |
| CSV Parsing | Papa Parse | 5.5+ | Lectura de rúbricas CSV |

### DevOps
| Herramienta | Versión | Propósito |
|------------|---------|----------|
| Docker | Latest | Contenedorización |
| Docker Compose | Latest | Orquestación de servicios |
| Bash/Shell | - | Scripts de desarrollo |

---

## 🏗 Arquitectura

### Diagrama General
```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente Navegador                      │
│                   (React + Tailwind CSS)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/CORS
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   ┌────▼─────┐                    ┌────▼─────────┐
   │  /api/*  │                    │  /static/*   │
   │           │                    │  /media/*    │
   │ Django    │                    │ (Files)      │
   │ REST API  │                    │              │
   └────┬─────┘                    └──────────────┘
        │
   ┌────▼──────────────────────┐
   │   Django ORM (Models)      │
   ├────────────────────────────┤
   │ - Profiles (Académicos)    │
   │ - Evidence (Documentos)    │
   │ - Evaluation (Evaluaciones)│
   │ - EvaluationScore (Puntajes)
   └────┬──────────────────────┘
        │
   ┌────▼──────────────────────┐
   │    SQLite / PostgreSQL     │
   └───────────────────────────┘
```

### Flujo de Autenticación
```
Usuario → Form Login → CSRF Check → Session Auth → Redirect (por rol)
                                          │
                                    ┌─────┴─────┐
                                    │           │
                              APPLICANT    EVALUATOR
                                    │           │
                                    ▼           ▼
                            Dashboard    EvaluatorDashboard
```

### Separación de Responsabilidades

**Backend (Django):**
- Gestión de base de datos
- Validación de datos
- Cálculo de puntajes
- Lógica de negocio
- Autenticación/Autorización

**Frontend (React):**
- Interfaz de usuario
- Captura de entrada
- Presentación de datos
- Navegación
- Manejo de estado local

---

## ✨ Features Implementadas

### 🔐 Módulo de Autenticación
- **Status:** ✅ Implementado
- **Endpoints:**
  - `POST /api/auth/csrf/` - Obtener token CSRF
  - `POST /api/auth/register/` - Registrar nuevo usuario
  - `POST /api/auth/login/` - Iniciar sesión
  - `POST /api/auth/logout/` - Cerrar sesión
- **Características:**
  - Autenticación basada en sesiones (cookies)
  - Protección CSRF integrada
  - Creación automática de perfil al registrar
  - Diferenciación de roles (APPLICANT, EVALUATOR, ADMIN)

### 👤 Módulo de Perfiles (Profiles)
- **Status:** ✅ Implementado
- **Funcionalidades:**
  - Crear/Editar perfil académico del profesor
  - Campos: nombre completo, teléfono, departamento, resumen académico
  - Relación 1:1 con User de Django
  - Timestamps de actualización
- **Endpoints:**
  - `GET /api/profile/me/` - Obtener perfil actual
  - `PUT/PATCH /api/profile/me/` - Actualizar perfil
  - `GET /api/applicants/` - Listar todos los postulantes

### 📄 Módulo de Evidencias (Evidence)
- **Status:** ✅ Implementado
- **Funcionalidades:**
  - Subir documentos comprobatorios
  - Clasificar por tipo (kind): grado_licenciatura, experiencia_docencia, etc.
  - Origen del documento: UPLOAD o PORTAL
  - Validación por evaluador (reviewed_by, reviewed_at)
  - Almacenamiento en `/media/evidences/user_*/`
- **Endpoints:**
  - `GET /api/profile/me/evidences/` - Listar mis evidencias
  - `POST /api/profile/me/evidences/` - Subir evidencia
  - `DELETE /api/profile/me/evidences/<id>/` - Eliminar evidencia

### 📋 Módulo de Evaluación (Evaluation)
- **Status:** ✅ Implementado (MVP)
- **Funcionalidades:**
  - Crear evaluaciones por pareja evaluador-postulante
  - Cargar rúbrica desde CSV (`criterios.csv`)
  - Captura de puntajes por celda (radio buttons, inputs numéricos)
  - Cálculo automático de totales por sección
  - Estados: DRAFT, COMPLETED
  - Almacenamiento de puntajes con unique_key (`I._1_col_A`, etc.)
- **Endpoints:**
  - `GET /api/evaluation/criterios/` - Obtener estructura de evaluación
  - `POST /api/evaluation/save/` - Guardar evaluación
  - `GET /api/evaluation/get/<applicant_id>/` - Obtener evaluación guardada
- **Características especiales:**
  - Parser de CSV robusto que detecta secciones, items, subitems
  - Generación automática de IDs para items sin ID explícito
  - Cálculo de máximos puntos por sección y validación

### 🎨 Páginas y Rutas
- **Status:** ✅ Implementado (básico)
- **Rutas disponibles:**
  - `/` → Redirect a `/applicant`
  - `/login` → Página de login
  - `/register` → Página de registro
  - `/applicant` → Dashboard de postulante
  - `/applicant/profile` → Editar perfil
  - `/applicant/evidences` → Gestionar evidencias
  - `/evaluator` → Dashboard de evaluador (lista de postulantes)
  - `/evaluation/:id` → Vista de evaluación completa

---

## 📁 Estructura del Proyecto

```
sistema_de_gestion_de_concursos/
│
├── backend/                           # Código del servidor Django
│   ├── apps/                          # Aplicaciones Django por módulo
│   │   ├── profiles/                  # Módulo de perfiles académicos
│   │   │   ├── models.py              # Profile, Evidence
│   │   │   ├── views.py               # Vistas REST
│   │   │   ├── serializers.py         # Serializadores DRF
│   │   │   ├── urls.py                # Rutas del módulo
│   │   │   ├── admin.py               # Configuración del admin
│   │   │   ├── migrations/            # Migraciones BD
│   │   │   └── tests.py               # Tests unitarios
│   │   │
│   │   └── evaluation/                # Módulo de evaluaciones
│   │       ├── models.py              # Evaluation, EvaluationScore
│   │       ├── views.py               # SaveEvaluation, GetEvaluation
│   │       ├── serializers.py         # Serializadores
│   │       ├── urls.py                # Rutas
│   │       ├── admin.py               # Admin
│   │       ├── migrations/
│   │       └── tests.py
│   │
│   ├── config/                        # Configuración principal
│   │   ├── settings.py                # Settings de Django
│   │   ├── urls.py                    # Rutas raíz
│   │   ├── asgi.py                    # Config ASGI
│   │   └── wsgi.py                    # Config WSGI
│   │
│   ├── core/                          # Código compartido (futuro)
│   │   └── views.py                   # Vista de criterios CSV
│   │
│   ├── static/                        # Recursos estáticos
│   │   └── evaluation/
│   │       └── criterios.csv          # Rúbrica de evaluación
│   │
│   ├── media/                         # Archivos subidos (evidencias)
│   │   └── evidences/
│   │       └── user_*/
│   │
│   ├── manage.py                      # CLI de Django
│   ├── Dockerfile                     # Imagen Docker del backend
│   ├── requirements.txt               # Dependencias Python
│   └── create_evaluator.py            # Script para crear evaluadores
│
├── frontend/                          # Código del cliente React
│   ├── src/
│   │   ├── api/                       # Clientes API
│   │   │   ├── client.js              # Cliente HTTP base
│   │   │   ├── auth.api.js            # Endpoints de autenticación
│   │   │   ├── profile.api.js         # Endpoints de perfiles
│   │   │   └── evaluation.api.js      # Endpoints de evaluaciones
│   │   │
│   │   ├── context/                   # Contextos de React
│   │   │   └── AuthContext.jsx        # Estado global de autenticación
│   │   │
│   │   ├── components/                # Componentes reutilizables
│   │   │   ├── layout/
│   │   │   │   └── MainLayout.jsx     # Layout principal con navbar
│   │   │   ├── applicant/             # Componentes para postulantes
│   │   │   ├── evaluation/            # Componentes para evaluación
│   │   │   └── ui/                    # Componentes UI base
│   │   │
│   │   ├── hooks/                     # Custom hooks
│   │   │   ├── useEvaluation.js       # Hook para evaluaciones
│   │   │   └── useProfile.js          # Hook para perfiles (legacy)
│   │   │
│   │   ├── pages/                     # Páginas completas
│   │   │   ├── LoginPage.jsx          # Página de login
│   │   │   ├── RegisterPage.jsx       # Página de registro
│   │   │   ├── Applicant/
│   │   │   │   ├── ApplicantDashboard.jsx
│   │   │   │   ├── ApplicantProfilePage.jsx
│   │   │   │   └── ApplicantDocumentsPage.jsx
│   │   │   ├── Evaluator/
│   │   │   │   └── EvaluatorDashboard.jsx
│   │   │   └── Evaluation/
│   │   │       ├── EvaluationPage.jsx
│   │   │       ├── EvaluationContainer.jsx
│   │   │       └── EvaluationView.jsx
│   │   │
│   │   ├── utils/                     # Funciones utilitarias
│   │   │   └── evaluation.mapper.js
│   │   │
│   │   ├── App.jsx                    # Componente raíz
│   │   ├── main.jsx                   # Punto de entrada
│   │   ├── index.css                  # Estilos globales
│   │   └── routes.js                  # Definición de rutas
│   │
│   ├── public/                        # Assets públicos
│   ├── Dockerfile                     # Imagen Docker del frontend
│   ├── package.json                   # Dependencias npm
│   ├── vite.config.js                 # Config de Vite
│   ├── tailwind.config.js             # Config de Tailwind
│   └── postcss.config.js              # Config de PostCSS
│
├── docker-compose.yml                 # Orquestación de servicios
├── dev.sh                             # Script para desarrollo local
├── stop.sh                            # Script para detener servicios
├── verify_auth.py                     # Script de verificación de auth
├── DOCUMENTATION.md                   # Este archivo
└── readme.md                          # Descripción general del proyecto
```

---

## 📐 Convenciones y Buenas Prácticas

### 🔤 Nomenclatura

#### Backend (Python/Django)
```python
# Modelos
class EvaluationScore(models.Model):  # PascalCase
    unique_key = models.CharField()   # snake_case

# Vistas (APIView)
class SaveEvaluationView(APIView):    # PascalCase + View
    def post(self, request):          # snake_case, métodos HTTP en minúsculas

# Funciones
def load_criterios():                 # snake_case
    pass

# Variables
SECTION_HEADERS = {}                  # SCREAMING_SNAKE_CASE para constantes
local_variable = None                 # snake_case
```

#### Frontend (JavaScript/React)
```javascript
// Componentes
function ApplicantDashboard() {}      // PascalCase
const ProfileForm = () => {};         // PascalCase

// Funciones y variables
const handleSubmit = () => {};        // camelCase
const eventsData = [];                // camelCase
const API_BASE = "http://...";        // SCREAMING_SNAKE_CASE (constantes)

// Hooks
function useEvaluation() {}            // use + PascalCase

// Archivos
src/components/ProfileForm.jsx        // PascalCase
src/hooks/useEvaluation.js            // use + camelCase
src/utils/helpers.js                  // snake_case
```

### 📝 Documentación de Código

#### Backend
```python
def save_evaluation(applicant_id, scores, status="DRAFT"):
    """
    Guarda o actualiza una evaluación para un postulante.
    
    Args:
        applicant_id (int): ID del postulante a evaluar
        scores (dict): Dict {unique_key: value} con puntajes
        status (str): Estado DRAFT o COMPLETED
        
    Returns:
        Evaluation: Instancia guardada
        
    Raises:
        ValueError: Si applicant_id no existe
    """
```

#### Frontend
```javascript
/**
 * Hook para cargar y gestionar evaluaciones
 * 
 * @returns {Object} {data, savedScores, saveEvaluation, loading, error}
 * 
 * @example
 * const { data, saveEvaluation } = useEvaluation();
 */
function useEvaluation() {}
```

### ✅ Validación de Datos

**Backend:**
- Usar serializers de DRF para validación automática
- Validar permisos en vistas (ownership checks)
- Sanitizar input de usuario en CSV parsing
- Validar rangos de puntajes

**Frontend:**
- Validación client-side básica en formularios
- No confiar en validaciones client-side (siempre validar en backend)
- Manejo graceful de errores 401/403/500

### 🔐 Seguridad

- ✅ CSRF protection habilitado en Django
- ✅ Session-based auth (cookies HttpOnly)
- ✅ CORS configurado para localhost:5173
- ❌ No usar localStorage para auth tokens (usar cookies)
- ✅ Validar permisos en backend (no en frontend)
- 🔄 TODO: Rate limiting en endpoints
- 🔄 TODO: Encriptación de datos sensibles

### 🎨 Estilos CSS

```jsx
// Usar Tailwind classes directamente en JSX
<div className="flex items-center justify-between gap-4 p-6 rounded-xl border border-slate-200">
  <span className="text-sm font-semibold text-slate-700">Evaluación</span>
</div>

// Clases reutilizables en tailwind.config.js si es necesario
// Evitar CSS-in-JS o CSS modules (Tailwind es suficiente)
```

### 📊 Manejo de Estado

**Frontend:**
```javascript
// ✅ BUENO: useState para estado simple
const [loading, setLoading] = useState(false);

// ✅ BUENO: useContext para auth global
const { user, logout } = useAuth();

// 🔄 TODO: Redux/Zustand para estado complejo (futuro)

// ❌ NO: Guardar datos en localStorage (excepto auth token dummy)
```

---

## 🔌 API Endpoints

### Autenticación
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/csrf/` | Obtener token CSRF | No |
| POST | `/api/auth/register/` | Registrar usuario | No |
| POST | `/api/auth/login/` | Iniciar sesión | No |
| POST | `/api/auth/logout/` | Cerrar sesión | Sí |

### Perfiles
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/profile/me/` | Obtener mi perfil | Sí |
| PUT | `/api/profile/me/` | Actualizar mi perfil | Sí |
| PATCH | `/api/profile/me/` | Actualizar parcialmente | Sí |
| GET | `/api/applicants/` | Listar postulantes | Sí |

### Evidencias
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/profile/me/evidences/` | Mis evidencias | Sí |
| POST | `/api/profile/me/evidences/` | Subir evidencia | Sí |
| DELETE | `/api/profile/me/evidences/<id>/` | Eliminar evidencia | Sí |

### Evaluaciones
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/evaluation/criterios/` | Obtener rúbrica CSV | Sí |
| POST | `/api/evaluation/save/` | Guardar evaluación | Sí |
| GET | `/api/evaluation/get/<applicant_id>/` | Obtener evaluación guardada | Sí |

### Respuestas Estándar
```json
// ✅ Éxito (200 OK)
{
  "id": 1,
  "user_id": 5,
  "full_name": "Juan Pérez",
  "role": "APPLICANT"
}

// ❌ Error (400 Bad Request)
{
  "detail": "username y password son requeridos"
}

// ❌ No autorizado (401 Unauthorized)
{
  "detail": "Authentication required"
}

// ❌ No encontrado (404 Not Found)
{
  "detail": "Not found"
}
```

---

## 🔄 Flujos Principales

### Flujo 1: Registro e Inicio de Sesión
```
1. Usuario accede a /register
2. Ingresa username y password
3. Frontend POST /api/auth/csrf/ → obtiene csrftoken
4. Frontend POST /api/auth/register/ → crea User + Profile
5. Se crea automáticamente Profile con role=APPLICANT
6. Redirect a /login
7. Usuario ingresa credenciales en /login
8. Frontend POST /api/auth/login/ → sesión activa
9. Redirect según role:
   - APPLICANT → /applicant
   - EVALUATOR → /evaluator
```

### Flujo 2: Completar Perfil y Subir Evidencias
```
1. Postulante en /applicant/profile
2. Completa: full_name, phone, department, summary
3. Click "Guardar" → PUT /api/profile/me/ → actualiza BD
4. Accede a /applicant/evidences
5. Frontend descarga criterios.csv desde /static/evaluation/criterios.csv
6. Parser CSV extrae tipos de evidencia requeridos (grado_licenciatura, etc.)
7. Para cada tipo, postulante puede:
   - Subir archivo → POST /api/profile/me/evidences/ (FormData)
   - Eliminar → DELETE /api/profile/me/evidences/<id>/
8. Los archivos se guardan en /media/evidences/user_<id>/
```

### Flujo 3: Evaluación Curricular (Evaluador)
```
1. Evaluador accede a /evaluator
2. Obtiene lista de postulantes → GET /api/applicants/
3. Selecciona postulante → navega a /evaluation/<applicant_id>
4. Frontend:
   a) GET /api/evaluation/criterios/ → obtiene estructura CSV parseado
   b) GET /api/evaluation/get/<applicant_id>/ → obtiene puntajes previos (si existen)
5. Evaluador completa tabla con puntajes:
   - Radio buttons para opciones (col_A, col_B, col_C)
   - Inputs numéricos para cantidades
   - Sistema automáticamente calcula totales por sección
6. Click "Finalizar Evaluación":
   - POST /api/evaluation/save/ → guarda evaluación con status=COMPLETED
   - Calcula puntaje total
   - Genera registro en BD (Evaluation + EvaluationScore)
```

### Flujo 4: Validación de Evidencias
```
1. Evaluador durante evaluación ve:
   - Mock data de evidencias por tipo (FUTURE: conexión real)
   - Estado: "Revisado" o "Validar"
2. Click "Validar" → marca como reviewed_by=evaluador, reviewed_at=now
3. Sistema genera constancia (FUTURE)
```

---

## 🚀 Guía de Desarrollo

### Configuración Inicial

#### Con Docker (Recomendado)
```bash
# Clonar repo
git clone <repo>
cd sistema_de_gestion_de_concursos

# Construir y levantar
docker-compose up --build

# Acceder
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

#### Sin Docker (Manual)
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

### Crear un Evaluador (Script)
```bash
python backend/create_evaluator.py
# Crea usuario 'evaluador1' con contraseña 'password123'
```

### Workflow de Desarrollo

#### 1. Crear una Nueva Feature
```bash
# 1. Crear rama
git checkout -b feature/nueva-feature

# 2. Desarrollo del backend
cd backend
# Crear migration si cambio modelos
python manage.py makemigrations
python manage.py migrate

# 3. Desarrollo del frontend
cd frontend
# Sin necesidad de build, Vite recarga automático

# 4. Testing
cd backend
python manage.py test

# 5. Commit
git add .
git commit -m "feat: descripción de cambios"
```

#### 2. Testing Manual
```bash
# Verificar autenticación
python verify_auth.py

# Testing con curl
curl -X POST http://localhost:8000/api/auth/csrf/ \
  -H "Content-Type: application/json"

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Debugging

#### Backend
```python
# En views.py
import logging
logger = logging.getLogger(__name__)
logger.info("Debug message")

# En Django shell
python manage.py shell
>>> from apps.profiles.models import Profile
>>> Profile.objects.all()
```

#### Frontend
```javascript
// Console.log es amigo
console.log('Estado:', valores);

// React DevTools (extensión del navegador)
// Vite devtools también disponible
```

### Checklist Pre-Commit
- [ ] Tests pasando
- [ ] Sin errores de linting (ESLint frontend)
- [ ] Código documentado
- [ ] Commits atómicos y descriptivos
- [ ] Ramas actualizado de main

---

## 🗺 Roadmap (Próximas Fases)

### Fase 2: Gestión de Convocatorias
- [ ] Modelo Convocatoria (fecha inicio, cierre, requisitos)
- [ ] Postulación a convocatorias
- [ ] Filtrado de postulantes por convocatoria
- [ ] Dashboard de admin para gestionar convocatorias

### Fase 3: Generación de Reportes
- [ ] Reporte PDF de evaluación
- [ ] Exportación a Excel de resultados
- [ ] Dashboard analítico por departamento
- [ ] Historial de evaluaciones por profesor

### Fase 4: Validación Automática
- [ ] OCR para certificados
- [ ] Validación contra sistema UNISON
- [ ] Alertas para evaluadores
- [ ] Notificaciones por email

### Fase 5: Mejoras de UX
- [ ] Modo oscuro
- [ ] Responsividad mejorada
- [ ] Internacionalización (ES/EN)
- [ ] Accesibilidad (A11y)

### Fase 6: Escalabilidad
- [ ] Migración a PostgreSQL
- [ ] Caché con Redis
- [ ] Búsqueda Elasticsearch
- [ ] CDN para archivos
- [ ] Load balancing

---

## 📚 Recursos Útiles

### Documentación Externa
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev/guide/)

### Comandos Comunes

```bash
# Backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
python manage.py runserver 0.0.0.0:8000

# Frontend
npm run dev       # Dev server
npm run build     # Build para producción
npm run lint      # Linting
npm run preview   # Preview de build

# Docker
docker-compose up --build
docker-compose down
docker-compose exec backend python manage.py migrate
docker-compose logs -f backend
```

### Contactos y Soporte
- **Equipo de Desarrollo:**
  - Ana Laura Chenoweth Galaz
  - Manuel Eduardo Gortarez Blanco
  - Braulio Alessandro Sanchez Bermudez

- **Documentación:** Ver `readme.md`
- **Issues:** Reportar en el repositorio

---

## 📝 Notas Importantes

### Decisiones de Diseño

1. **Sesiones vs JWT:** Se usa session-based auth con cookies por simplicidad en desarrollo. Migración a JWT es posible en futuro.

2. **CSV vs Base de Datos para Rúbricas:** La rúbrica se carga desde CSV por:
   - Facilidad de actualización sin redeployment
   - Compatibilidad con formatos legados UNISON
   - En futuro, se podría migrar a BD

3. **SQLite en Desarrollo:** Para MVP está bien. PostgreSQL recomendado para producción.

4. **No usar localStorage para Auth:** Las cookies de sesión son más seguras. El localStorage debe ser readonly (para datos no sensibles).

### Problemas Conocidos y TODOs

- [ ] ApplicantDashboard no muestra estado real de postulación
- [ ] EvaluatorDashboard hardcodeado a evaluador actual (falta obtener user.id)
- [ ] Mock de evidencias en EvaluationView (sin datos reales del backend)
- [ ] Sin paginación en listas de postulantes
- [ ] Sin validaciones de archivo type/size en upload
- [ ] Parser CSV no maneja casos edge (enclosures, escapes)
- [ ] Sin notificaciones al usuario (sólo alerts)
- [ ] Sin rate limiting en API

### Performance Considerations

- Frontend: Vite está optimizado. No necesita más optimizaciones por ahora.
- Backend: Agregar `.select_related()` y `.prefetch_related()` cuando queries de N+1
- BD: Crear índices en campos de búsqueda (applicant_id, evaluator_id)

---

**Última actualización:** Marzo 2026  
**Versión:** 0.1.0 (MVP)  
**Estado:** En desarrollo activo