# ![](https://github.com/unix4you2/practico/raw/master/img/logo.png) Imagen Lite

Este es un proyecto derivado de [Práctico Framework](https://www.practico.org//) articulable como plugin o complemento

Pruébalo en línea directamente en [Este enlace](https://imagen-lite.practico.run) con cualquier imágen de tu computadora.

Herramienta que mediante JS minimiza el tamaño de diferentes formatos de imágen para ocupar menos espacio

# Optimizador de Imágenes

Aplicación web para **comprimir y optimizar imágenes PNG, JPG, JPEG y WebP** manteniendo la calidad visual y preservando el formato original. Permite reducir significativamente el tamaño de las imágenes para mejorar tiempos de carga y eficiencia en sitios web o aplicaciones.

---

## Características principales

- Soporte para formatos PNG, JPG, JPEG y WebP.
- Conservar formato original en la imagen comprimida.
- Vista previa de imagen original y optimizada para comparar.
- Control dinámico de calidad de compresión mediante slider.
- Algoritmo PNG optimizado para preservar transparencia y paleta, evitando degradación visual.
- Algoritmo JPEG avanzado con análisis de contenido y calidad adaptativa.
- Reducción de tamaño real y reporte de estadísticas (porcentaje y bytes ahorrados).
- Descarga fácil de la imagen optimizada con nombre personalizado.
- Interfaz moderna, compacta y amigable, compatible con dispositivos móviles.
- Procesamiento 100% local en el navegador, sin subir imágenes a servidores externos, preservando la privacidad.

---

## Uso

1. Arrastra o selecciona una imagen en el área de carga.
2. Visualiza la imagen original y la versión optimizada en tiempo real.
3. Ajusta el nivel de calidad con el control deslizante para equilibrar calidad y tamaño.
4. Descarga la imagen optimizada haciendo clic en el botón de descarga.

---

## Estructura del proyecto

- `index.html`: Interfaz de usuario y estructura principal.
- `style.css`: Estilos modernos y responsivos con modo oscuro.
- `app.js`: Lógica de compresión y procesamiento de imágenes, optimizada para PNG y JPEG.
  
---

## Tecnologías utilizadas

- HTML5, CSS3, JavaScript.
- API Canvas para manipulación y compresión de imágenes.
- Bootstrap 5 para diseño responsivo y componentes modernos.
- Bootstrap Icons para iconografía.

---

## Consideraciones

- El proceso de compresión se realiza completamente en el navegador, no se envían imágenes a ningún servidor.
- El algoritmo PNG está diseñado para preservar al máximo la calidad y transparencia, aunque la tasa de compresión puede variar según la imagen.
- Para imágenes muy complejas o con transparencia extensa, la reducción puede ser moderada para no afectar la calidad visual.

---

## Contacto

Si tienes preguntas o sugerencias, por favor abre un issue o contribuye vía Pull Request.

---

_Disfruta optimizando tus imágenes de forma sencilla y eficiente!_
