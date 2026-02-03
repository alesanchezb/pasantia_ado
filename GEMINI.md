# Project context

This is a Django backend project.

## Stack
- Django
- Django REST Framework
- JWT authentication
- React frontend
- Linux environment

## Conventions
- Use class-based views
- Avoid function-based auth views
- Prefer services for business logic
- Follow clean architecture

## Current goals
- Refactor evaluations logic
- Clean authentication system
- Improve project structure

## Features
- Interfaz postulante
  - Features:
    1. Boton para subir archivos pueden ser varios
    2. Mostrar los puntajes por separado, pero no mostrar el total por seccion y el total general

- Features para evaluacion:
  1. Corregir algunas partes de la encuesta ya que, no todas usan radio buttoms, sino que son por cantidad enteras positivas de numeros
  2. Agregar algun icono que muestre cual documento se encuentra en el portal (trata de que el icono salga al costado de la pregunta que subio el documento para que el evaludor pueda saber rapdio en donde esta y poner la cantidad o validar)
  3. Mostrar que ya se reviso por otra, y quien lo reviso con su fecha.
  4. Secciones con varias archivos, poder revisar cada documento.
  
