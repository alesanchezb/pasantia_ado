# Documentación
Sistema de Gestión de Concursos y Evaluación Curricular
Universidad de Sonora

---

## 1. Propósito de este documento

Este documento describe el **diseño interno**, la **modelación del dominio**, las **decisiones arquitectónicas** y los **flujos técnicos** del sistema de gestión de concursos y evaluación curricular.

Está dirigido a:
- Desarrolladores que mantendrán o extenderán el sistema.
- Asesores académicos que evalúan el diseño del software.
- Lectores técnicos que requieren comprender la estructura interna del sistema.

---

## 2. Enfoque de diseño

El sistema fue diseñado bajo los siguientes principios:

- Centralización de la información curricular.
- Reutilización de datos y evidencias documentales.
- Separación clara de responsabilidades.
- Desarrollo incremental para evitar sobre–ingeniería.
- Trazabilidad y auditabilidad del proceso de evaluación.

El diseño privilegia la claridad conceptual sobre la complejidad técnica innecesaria.

---

## 3. Arquitectura general

El sistema sigue una arquitectura cliente-servidor con separación clara entre presentación y lógica de negocio.

- El backend concentra la lógica de dominio, validaciones, reglas de evaluación y persistencia.
- El frontend actúa como cliente que consume una API.
- Los archivos comprobatorios se gestionan fuera de la base de datos, manteniendo referencias estructuradas.

No se asume una dependencia fuerte del frontend, permitiendo su reemplazo o evolución.

---

## 4. Organización del backend

El backend se organiza en tres niveles principales:

- Proyecto Django: configuración global.
- Aplicaciones: módulos funcionales del dominio.
- Código transversal: utilidades compartidas.

Esta organización permite que cada módulo evolucione de forma independiente.

