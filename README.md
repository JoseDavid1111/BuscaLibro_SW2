📚 BuscaLibro: Sistema de Gestión de Pedidos e Inventario
BuscaLibro es una solución web diseñada para optimizar el flujo de trabajo de librerías y centros de lectura. El sistema centraliza el control de inventario, el seguimiento de pedidos y la generación de inteligencia de negocios mediante reportes estadísticos, resolviendo la falta de visibilidad en las fechas de entrega y disponibilidad de ejemplares.

📋 Problemática y Contexto
Actualmente, la gestión manual o descentralizada en las librerías provoca errores en el control de stock y retrasos en las entregas. BuscaLibro nace para:

Eliminar la incertidumbre sobre la disponibilidad de ejemplares.

Automatizar la actualización del inventario en tiempo real.

Interconectarse con otros modelos de negocio mediante el intercambio de archivos JSON.

Proveer datos cuantificables para la toma de decisiones estratégicas.

🚀 Requerimientos Funcionales (RF)
El sistema se ha desarrollado bajo los siguientes pilares funcionales:

Gestión de Pedidos e Inventario
RF-01 & RF-03: Registro y edición de pedidos vinculando usuario, libro y fechas automáticas.

RF-02 & RF-04: Validación de stock antes de confirmar y actualización automática (suma/resta) de unidades.

RF-09 & RF-10: Borrado lógico de pedidos y gestión completa de bajas (CRUD) de libros y autores.

Consultas y Visualización
RF-05: Búsqueda individual por ISBN o código para verificar estado (Disponible, Prestado, Reserva).

RF-06: Listado general con filtros avanzados por autor, categoría o disponibilidad.

RF-07: Historial detallado de préstamos por usuario.

Inteligencia y Reportes (RF-08)
El sistema genera informes tabulares y estadísticos que incluyen:

📈 Libros con mayor demanda.

📊 Frecuencia de préstamos por categoría.

✅ Porcentaje de cumplimiento en devoluciones.
