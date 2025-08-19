# Changelog - Optimizador de Imágenes

Todos los cambios importantes en este proyecto se documentan en este archivo.

---

## [1.3.0] - 2025-08-19
### Mejoras
- Implementación de algoritmo avanzado para compresión PNG inspirado en TinyPNG, con análisis de colores y transparencia.
- Sistema multi-pasada para obtener mejor compresión sin pérdida visible.
- Optimización JPEG adaptativa con análisis de contenido y suavizado inteligente.
- Vista previa dinámica y actualización en tiempo real al mover el slider de calidad.
- Interfaz moderna y compacta mantenida, con diseño responsive.

### Correcciones
- Ajustes en la cuantización PNG para preservar mejor la paleta de colores y evitar degradación visual.
- Corrección de errores que provocaban que algunos PNG no se comprimieran correctamente y subieran de tamaño.
- Mejor manejo de transparencia en PNG, asegurando que no se altere durante la compresión.
- Solución de problemas con la actualización de estadísticas y visualización al modificar calidad.

---

## [1.2.0] - 2025-08-15
### Mejoras
- Agregada vista previa lado a lado de imagen original y comprimida.
- Optimización del slider de calidad con debounce para mejor experiencia usuario.
- Estadísticas detalladas incluyendo porcentaje de reducción y tamaño en KB/MB.

### Correcciones
- Ajuste en la preservación del formato original en la descarga de archivos.
- Fix en la actualización dinámica de texto e indicadores de progreso.

---

## [1.1.0] - 2025-08-10
### Mejoras
- Primera versión funcional con soporte para PNG, JPEG y WebP.
- Comprobación básica de tamaños y formatos con mensajes claros de error.
- Descarga funcional del archivo optimizado manteniendo extensión original.

---

## [1.0.0] - 2025-08-05
### Lanzamiento Inicial
- Implementación básica de compresión usando Canvas.
- Interfaz drag & drop para subir imágenes.
- Control de calidad básico mediante slider.
- Visualización de información de tamaño y dimensiones.

---

## Notas

- Se recomienda actualizar a la última versión para mejoras substanciales en calidad y compresión.
- El proyecto continúa en desarrollo, nuevos formatos y mejoras están planeadas para el futuro cercano.
