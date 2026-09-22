# Seguridad

No publiques vulnerabilidades, credenciales ni datos personales en un issue público. Para reportes de seguridad, contacta al mantenedor mediante su [perfil de LinkedIn](https://www.linkedin.com/in/corozco9408/) indicando únicamente que deseas abrir un canal privado.

El portal aplica validación de enlaces HTTPS, consultas parametrizadas, límites persistentes en el Worker de borde, campos trampa, deduplicación y almacenamiento de huellas irreversibles. Las rutas públicas de escritura pueden exigir además Cloudflare Turnstile, cuyo token se valida en el servidor, se vincula a una acción concreta y no se reutiliza.

Turnstile requiere `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` de un widget real restringido al dominio del portal. No se deben utilizar claves de prueba en producción. El límite de frecuencia utiliza `RATE_LIMIT_SALT`, que debe mantenerse como secreto y rotarse si se sospecha exposición.

Estas medidas reducen abuso, pero no sustituyen una revisión de seguridad independiente ni las reglas WAF administradas por quien controle el dominio perimetral.
