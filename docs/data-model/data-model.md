# Data Model

> Actualizar con las entidades reales del proyecto.

## Entidades del dominio

### Ejemplo: User

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador único |
| email | VARCHAR(255) UNIQUE | Email del usuario |
| created_at | TIMESTAMP | Fecha de creación |

## Reglas de negocio del dominio

> Documentar aquí las reglas que el agente debe respetar al generar código.
