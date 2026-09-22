# Política editorial y operación

## Qué se actualiza automáticamente

`/api/noticias` consulta menciones recientes de “Abelardo de la Espriella” mediante Google News RSS y GDELT; si existe la variable secreta `NEWS_API_KEY`, también utiliza NewsAPI. La respuesta se renueva cada seis horas. Los resultados se contrastan con un directorio explícito de dominios y se separan entre fuentes nacionales e internacionales.

Las fuentes nacionales incluyen Presidencia, CNE, Registraduría, altas cortes, órganos de control, Congreso, Cancillería, fuerza pública y medios colombianos identificados. Las internacionales incluyen organismos multilaterales, portales oficiales extranjeros y canales como DW, Reuters, AP, BBC, France 24, CNN en Español y El País.

La presencia de un artículo en el monitor no significa que sus afirmaciones estén verificadas. El monitor es una bandeja de descubrimiento pública.

## Qué se considera documentado

El archivo principal se edita en `app/page.tsx`. Para incorporar un registro debe existir:

1. Una fuente primaria verificable; o dos fuentes periodísticas independientes.
2. Lenguaje que distinga denuncia, investigación, imputación y decisión judicial.
3. Enlace estable y fecha del documento o publicación.
4. Respuesta de la persona o institución señalada, si está disponible.

No se publican rumores, capturas sin procedencia, titulares que excedan lo probado por la fuente ni resúmenes generados sin revisión humana.

## Comparación de coberturas

El comparador aplica una rúbrica general y reproducible en cinco capas:

1. Agrupa publicaciones por tema, cercanía temporal y similitud léxica.
2. Describe el encuadre observable del titular con las cuatro funciones de Robert Entman: definición del problema, atribución causal, evaluación y respuesta propuesta.
3. Organiza la transparencia con indicadores de The Trust Project: tipo de contenido, referencias, propiedad y rendición de cuentas cuando están documentadas.
4. Calcula amplitud de contraste mediante pluralidad de fuentes, diversidad de propietarios, presencia de una fuente primaria y distancia entre titulares.
5. Añade orientación y factualidad únicamente desde evaluaciones externas trazables. No las infiere mediante inteligencia artificial.

El análisis automático se limita al titular disponible y describe lenguaje, no intención. La amplitud de contraste no es una puntuación de verdad. Cuando faltan datos, el sistema se abstiene de calificar.

## Actualización

El endpoint envía una política de caché de seis horas, con disponibilidad de la respuesta anterior durante una actualización. Para usar NewsAPI en el despliegue, configure `NEWS_API_KEY` como secreto del sitio. La clave nunca debe añadirse al repositorio ni al código del navegador.

## Correcciones

Cuando cambie el estado de un caso, actualice el texto y el estado del registro, conserve la fuente anterior si sigue siendo pertinente y anote la nueva fecha de revisión en el pie de página.
