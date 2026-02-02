# Sistema de Gestión de Concursos y Evaluación Curricular
Universidad de Sonora

## Descripción general
Este proyecto corresponde al desarrollo de un sistema web institucional para la Universidad de Sonora, cuyo objetivo es apoyar la gestión de concursos de ingreso y evaluación curricular del personal académico, conforme al Estatuto de Personal Académico (EPA) y a los reglamentos y formatos de evaluación vigentes.

El sistema permite centralizar la información curricular de los profesores, reutilizar evidencias documentales en múltiples convocatorias, automatizar la aplicación de rúbricas de evaluación y conservar el historial de evaluaciones y dictámenes, reduciendo la carga administrativa y mejorando la trazabilidad y transparencia del proceso.

---

## Objetivos del proyecto

### Objetivo general
Desarrollar un sistema web que permita la gestión centralizada de concursos académicos y evaluaciones curriculares del personal académico de la Universidad de Sonora, facilitando la reutilización de información curricular, la evaluación objetiva mediante rúbricas configurables y la consulta histórica de resultados.

### Objetivos específicos
- Diseñar un modelo de datos que represente el currículum académico del profesor y sus evidencias documentales.
- Implementar un sistema de autenticación y control de acceso basado en roles.
- Permitir la creación y gestión de convocatorias académicas.
- Facilitar la postulación de profesores a convocatorias reutilizando su información curricular.
- Automatizar la captura de puntajes mediante rúbricas de evaluación.
- Generar dictámenes y reportes de resultados por convocatoria y por profesor.
- Conservar el historial de evaluaciones para consulta y análisis posterior.

---

## Alcance funcional (MVP)

### Roles del sistema
- Profesor aspirante
- Evaluador
- Administrador de convocatoria

### Módulos incluidos
- Autenticación de usuarios
- Perfil académico del profesor (currículum)
- Carga y gestión de documentos comprobatorios
- Gestión de convocatorias
- Postulación a convocatorias
- Evaluación curricular mediante rúbricas
- Historial de evaluaciones
- Reporte básico de resultados

---

## Arquitectura general

El proyecto se desarrolla con una arquitectura cliente-servidor:

- Backend: Django (API REST)
- Frontend: aplicación web independiente (por ejemplo, React)
- Base de datos: PostgreSQL (configurable)
- Almacenamiento de archivos: sistema de archivos del servidor mediante MEDIA_ROOT

---

## Estructura del proyecto

```text
./sistema_de_gestion_de_concursos
├── backend
│   ├── apps                         # Aplicaciones Django por módulo funcional
│   │   ├── __init__.py
│   │   ├── profiles                 # Perfil académico del profesor (app inicial)
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── __init__.py
│   │   │   ├── migrations
│   │   │   │   └── __init__.py
│   │   │   ├── models.py
│   │   │   ├── tests.py
│   │   └── └── views.py
│   ├── config                      # Configuración principal del proyecto Django
│   │   ├── asgi.py
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── core/                       # Código compartido (permisos, utilidades)
│   ├── manage.py
│   ├── static/                     # Recursos estáticos
│   └── media/                      # Archivos subidos por los usuarios (evidencias)
├── frontend
│   └── (aplicación web cliente)
├── requirements.txt
├── documentation.md
└── readme.md
```

## Gestión de archivos

### Archivos estáticos (static/)

Contiene recursos estáticos del sistema, como hojas de estilo, imágenes institucionales o archivos necesarios para la generación de documentos (por ejemplo, logos para dictámenes en PDF). Su uso es opcional si el frontend es externo.

### Archivos de usuario (media/)

Almacena los documentos subidos por los profesores y generados por el sistema, tales como:

- Títulos y cédulas profesionales
- Constancias de experiencia docente y profesional
- Artículos y producción académica
- Dictámenes generados por convocatoria

--- 

### Requisitos del sistema

#### Requisitos de software

- Python 3.13 o superior 

--- 

## Ejecución con Docker (Recomendado)

Esta es la forma más sencilla de ejecutar tanto el backend como el frontend, asegurando un entorno reproducible.

### Requisitos previos
- [Docker](https://www.docker.com/get-started)
- Docker Compose (usualmente incluido en Docker Desktop)

### Pasos
1. Abre una terminal en la raíz del proyecto.
2. Ejecuta el siguiente comando para construir y levantar los servicios:

   ```bash
   docker compose up --build
   ```

3. Accede a las aplicaciones:
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:8000

---

## Instalación y configuración del backend (Manual)

1. Clonar el repositorio:

```
git clone git@github.com:alesanchezb/pasantia_ado.git
cd backend
```

2. Crear y activar entorno virtual:

```
python -m venv .env
source .env/bin/activate
```

3. Instalar dependencias:

```
pip install -r requirements.txt
```

4. Configurar variables de entorno:
Crear un archivo .env con las variables necesarias.

5. Ejecutar migraciones:

```
python manage.py migrate
```

6. Iniciar el servidor de desarrollo:

```
python manage.py runserver
```

## Uso del sistema (resumen)

- Los profesores registran y mantienen actualizado su perfil académico.
- Los profesores postulan a convocatorias abiertas reutilizando su información curricular.
- Los evaluadores revisan expedientes y asignan puntajes mediante rúbricas.
- El sistema calcula puntajes totales y genera dictámenes.
- Los usuarios pueden consultar el historial de evaluaciones y resultados.

## Desarrollo incremental

El sistema se desarrolla de forma incremental, iniciando con un módulo central (perfil académico) y agregando nuevas aplicaciones conforme se identifican nuevas necesidades funcionales, evitando sobre–ingeniería temprana y facilitando la comprensión del sistema.

## Consideraciones de seguridad

- Control de acceso basado en roles.
- Restricción de acceso a documentos según permisos.
- Uso de variables de entorno para información sensible.
- Validación de archivos subidos por los usuarios.


## Autores

Proyecto desarrollado como parte de un trabajo académico para el Departamente de Matemáticas de la Universidad de Sonora.

- Ana Laura Chenoweth Galaz
- Manuel Eduardo Gortarez Blanco
- Braulio Alessandro Sanchez Bermudez


