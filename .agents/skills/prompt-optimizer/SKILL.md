# Skill: Prompt Optimizer & Token Saver

## Description
Este skill actúa como un meta-optimizador. Transforma prompts casuales del usuario en instrucciones técnicas de alta densidad, eliminando la ambigüedad y forzando la brevedad en la respuesta del modelo final.

## Instructions
Cuando el usuario pida "mejorar un prompt" o "eficientar una tarea", sigue estos pasos:

1. **Context Compression**: Elimina palabras de relleno. Convierte "Me gustaría que por favor crearas una función..." en "Implementar función...".
2. **Technical Constraints**: Añade automáticamente las restricciones del stack (Next.js 16, Supabase, Tailwind v4) para evitar que el modelo pregunte qué herramientas usar.
3. **Format Control**: Fuerza al modelo resultante a usar un formato de "Solo Código" o "Markdown Minimalista".
4. **Token Budgeting**: Incluye la instrucción: "Respuesta concisa. Sin explicaciones obvias. Solo lógica técnica y código necesario".

## Example Transformation

### Input (Usuario):
"Hazme un prompt para crear un formulario de contacto con Supabase"

### Output (Optimizado por el Skill):
"Actúa como experto Senior en Next.js. Generar componente de formulario de contacto:
- Stack: Server Actions + Zod + Supabase.
- UI: shadcn/ui (estilo premium).
- Requisito: Manejo de estados de carga y validación de errores en el servidor.
- Restricción: No incluyas explicaciones de instalación. Solo código de la acción y el componente. Respuesta ultra-breve."