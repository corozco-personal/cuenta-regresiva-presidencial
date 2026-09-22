# Seguridad

No publiques vulnerabilidades, credenciales ni datos personales en un issue público. Para reportes de seguridad, contacta al mantenedor mediante su [perfil de LinkedIn](https://www.linkedin.com/in/corozco9408/) indicando únicamente que deseas abrir un canal privado.

El portal aplica validación de enlaces HTTPS, consultas parametrizadas, límites persistentes en el Worker de borde, campos trampa, deduplicación y almacenamiento de huellas irreversibles. Las rutas públicas de escritura pueden exigir además Cloudflare Turnstile, cuyo token se valida en el servidor, se vincula a una acción concreta y no se reutiliza.

Turnstile requiere `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` de un widget real restringido al dominio del portal. No se deben utilizar claves de prueba en producción. El límite de frecuencia utiliza `RATE_LIMIT_SALT`, que debe mantenerse como secreto y rotarse si se sospecha exposición.

Estas medidas reducen abuso, pero no sustituyen una revisión de seguridad independiente ni las reglas WAF administradas por quien controle el dominio perimetral.

## Cola, cuarentena y trazabilidad

Ningún envío de opinión, noticia o solicitud de corrección se publica en la misma petición que lo recibe. El flujo almacena primero el registro como pendiente o en cuarentena. La vista pública consulta exclusivamente estados aprobados; los aportes con señales de automatización, inyección, burla, spam, lenguaje ofensivo o enlaces inseguros no se amplifican.

Cada cambio de estado se guarda en `moderation_actions`. Los eventos de seguridad se agregan en `security_events` con categoría, severidad, ruta lógica y huellas irreversibles del origen y de la carga. El contenido hostil, la dirección de red y el agente de usuario no se guardan en ese registro ni se muestran en `/reportes`.

No existe aprobación automática. Los filtros solo deciden si un envío llega a la cola de revisión o a cuarentena; la publicación exige una decisión manual del propietario desde un espacio privado protegido por inicio de sesión y una lista blanca aplicada en el servidor. Los rechazos se clasifican y conservan como eventos agregados para el reporte de seguridad.
