# Cuenta pública

Portal ciudadano e independiente para seguir el periodo presidencial de Colombia mediante una cuenta regresiva, noticias nacionales e internacionales, promesas de campaña, fuentes documentales, indicadores y participación ciudadana.

**Sitio público:** [cuenta-regresiva-presidencial.carlos940807.chatgpt.site](https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site)

## Propósito

La información sobre un presidente suele estar distribuida entre entidades oficiales, medios, documentos, declaraciones y conversaciones públicas. Cuenta pública reúne esas piezas en un solo lugar, conserva el enlace a su procedencia y diferencia entre documentos oficiales, cobertura periodística y opiniones.

El proyecto no busca decirle a las personas qué pensar ni promover una posición política o social. Su objetivo es reducir la brecha producida por la cantidad y heterogeneidad de la información, facilitando que cada visitante consulte las fuentes y forme su propio criterio.

Es una iniciativa personal de **Carlos Eduardo Orozco**, sin financiación, promoción o afiliación con partidos, campañas, gobiernos, empresas, organizaciones o movimientos de ningún tipo. Es de acceso libre, sin ánimo de lucro y no busca generar ingresos.

## Funcionalidades

- Cuenta regresiva hasta la fecha constitucional estimada de entrega de la Presidencia.
- Barra temporal del mandato con porcentaje transcurrido e hitos anuales.
- Seguimiento de promesas con estados, plazos, avance documental y evidencias.
- Monitor de noticias nacionales e internacionales desde el inicio de la campaña.
- Actualización de fuentes cada seis horas mediante caché del servidor y una ejecución programada pública.
- Agrupación de coberturas similares para reducir duplicados.
- Archivo cronológico con búsqueda y filtros por etapa y alcance.
- Directorio mundial de medios e instituciones admitidas para monitoreo.
- Muro de opiniones con anonimato opcional, cola previa, moderación, cuarentena y detección de duplicados.
- Reporte interno de intentos de automatización, spam, enlaces inseguros e inyección, visible solo en el centro de cotejo.
- Formulario para proponer noticias con evaluación de enlace, fuente y relevancia.
- Indicadores de favorabilidad y usuarios activos agregados.
- Resumen diario de lectura rápida y búsqueda global por noticia, fuente, promesa o sección.
- Aplicación instalable (PWA) con una copia de navegación básica disponible sin conexión.
- Centro privado de cotejo con colas separadas, señales técnicas seudónimas, auditoría, respaldo y reportes.
- Resumen semanal descargable y canal RSS público.
- Bitácora pública de correcciones y metodología editorial.
- Modo de bajo consumo y diseño responsive.

## Criterio editorial

La aparición de una noticia no certifica todas las afirmaciones de la fuente ni representa una posición del proyecto. El sistema:

1. admite fuentes mediante un directorio público;
2. exige enlaces HTTPS, fechas válidas y relación directa con el tema monitoreado;
3. diferencia alegación, investigación, imputación, decisión judicial y hecho documentado;
4. conserva y muestra la procedencia de cada registro;
5. agrupa coberturas que describen un mismo hecho;
6. registra las correcciones editoriales relevantes; y
7. separa hechos, coberturas periodísticas y opiniones ciudadanas.

La metodología completa puede consultarse en [`EDITORIAL.md`](./EDITORIAL.md) y en la [página pública de metodología](https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/metodologia).

## Uso de inteligencia artificial

La inteligencia artificial se utilizó como apoyo para el diseño, desarrollo, programación, pruebas y organización inicial de la plataforma. No se utiliza como fuente autónoma ni para presentar afirmaciones generadas como hechos comprobados.

El portal busca que lo publicado sea trazable hasta su fuente, sus datos o su método. Trazabilidad no significa que toda afirmación de una fuente sea verdadera: permite comprobarla, contrastarla y cuestionarla.

## Tecnologías

- React 19 y TypeScript
- Next.js 16 sobre Vinext/Vite
- Cloudflare Workers y D1
- Drizzle ORM
- Tailwind CSS
- Recharts
- Lucide Icons
- OpenAI Sites para publicación

## Desarrollo local

### Requisitos

- Node.js `>=22.13.0`
- npm

### Instalación

```bash
git clone https://github.com/corozco-personal/cuenta-regresiva-presidencial.git
cd cuenta-regresiva-presidencial
npm ci
```

Construye el proyecto para generar la configuración local del Worker:

```bash
npm run build
```

Aplica las migraciones D1 en orden:

```bash
for migration in drizzle/*.sql; do
  node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file "$migration"
done
```

Inicia el entorno de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible normalmente en `http://localhost:5173`.

## Variables de entorno

El portal funciona con Google News RSS, GDELT y las fuentes curadas incluidas en el código. De forma opcional puede utilizar NewsAPI:

```text
NEWS_API_KEY=tu_clave
```

Los formularios ciudadanos admiten Cloudflare Turnstile. En producción deben configurarse un widget restringido al dominio público y estas variables:

```text
TURNSTILE_SITE_KEY=clave_publica_del_widget
TURNSTILE_SECRET_KEY=secreto_del_widget
RATE_LIMIT_SALT=valor_aleatorio_largo
AUDIT_ENCRYPTION_KEY=clave_aleatoria_independiente
```

La clave pública se entrega al navegador mediante `/api/seguridad`; el secreto nunca se expone. Cuando ambas claves existen, opiniones, noticias aportadas y solicitudes de corrección exigen un token válido, de un solo uso y correspondiente a la acción esperada. Sin las dos claves, Turnstile permanece desactivado para no simular una protección inexistente. El límite persistente por IP, agente, ruta y ventana temporal funciona de manera independiente en el Worker.

Las notificaciones de revisión pueden usar Resend con `RESEND_API_KEY`, `REVIEW_NOTIFICATION_EMAIL`, `REVIEW_FROM_EMAIL` y `RESEND_WEBHOOK_SECRET`. El webhook firmado registra entrega o rebote sin hacer pública la dirección del revisor.

No agregues claves reales al repositorio. Los archivos `.env*` están ignorados por Git y los secretos de producción deben configurarse en la plataforma de alojamiento.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera el Worker y los recursos de producción. |
| `npm run start` | Ejecuta localmente el resultado construido. |
| `npm run lint` | Revisa el código con ESLint. |
| `npm run db:generate` | Genera migraciones después de modificar el esquema. |

## Estructura principal

```text
app/                 Rutas, páginas, componentes y API
app/api/             Noticias, opiniones, aportes, indicadores y analítica
app/data/            Datos editoriales compartidos
db/                  Esquema y conexión D1 mediante Drizzle
drizzle/             Migraciones SQL
public/              Recursos públicos y metadatos de seguridad
.openai/hosting.json Configuración lógica del sitio alojado
```

## Privacidad y seguridad

- La analítica de audiencia detallada es privada y usa datos agregados.
- No se incorporan rastreadores publicitarios.
- Los identificadores utilizados para limitar opiniones duplicadas se transforman criptográficamente y no se muestran públicamente.
- Las preferencias de interfaz se guardan localmente en el navegador.
- Los reportes internos no exponen direcciones IP ni rutas de administración.
- Los formularios públicos utilizan límites persistentes en el borde; las identidades de red se almacenan únicamente como huellas con sal secreta.
- El centro de cotejo conserva de forma privada señales mínimas del navegador, dispositivo, país aproximado del borde y una referencia seudónima de red. No conserva la IP sin transformar ni presenta esas señales como prueba de identidad civil.
- Los contactos opcionales de solicitudes editoriales se cifran con AES-GCM y solo se descifran dentro del espacio privado autorizado.
- Turnstile se valida exclusivamente en el servidor cuando sus credenciales de producción están configuradas.
- La política pública está disponible en [`/privacidad`](https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/privacidad).

## Contribuciones

Antes de proponer un cambio editorial, incluye la fuente original, la fecha y una explicación verificable. No envíes rumores, capturas sin procedencia, información privada, insultos ni contenido que confunda una alegación con un hecho probado.

Para cambios de código:

1. crea una rama desde `main`;
2. realiza cambios acotados;
3. ejecuta `npm run lint && npm run build`; y
4. abre un pull request explicando el propósito y la validación realizada.

## Capacidades avanzadas

- Archivo persistente de noticias y registro público de ejecuciones del monitor.
- Expedientes temáticos, estado de cobertura y API de datos abiertos en JSON/CSV.
- Solicitudes públicas de corrección, actualización y derecho de réplica.
- Alertas RSS filtrables y generador local de tarjetas para redes sociales.
- Comparador de coberturas con rúbrica de encuadre de Entman, indicadores de transparencia de The Trust Project y contexto externo documentado; los medios sin evaluación permanecen explícitamente sin calificar.
- Controles antiabuso y verificación automática con GitHub Actions.
- Ejecución programada cada seis horas y respaldo de los conjuntos públicos durante 30 días mediante GitHub Actions.

### Datos abiertos y estado

- Estado del sistema: `/api/estado`
- Noticias: `/api/datos/noticias` o `/api/datos/noticias?format=csv`
- Promesas: `/api/datos/promesas` o `/api/datos/promesas?format=csv`
- Correcciones: `/api/datos/correcciones`

Los metadatos propios se publican bajo CC BY 4.0. Los contenidos enlazados conservan los derechos de sus fuentes originales.

### Integraciones pendientes de credenciales

El proyecto está preparado para incorporar un dominio personalizado y un proveedor de correo transaccional. No se activan por defecto: requieren un dominio controlado por el mantenedor, configuración DNS y credenciales del proveedor elegido.

## Licencia

El código fuente se distribuye bajo la [licencia MIT](./LICENSE). Las marcas, textos y contenidos enlazados de terceros pertenecen a sus respectivos titulares y conservan sus propias condiciones de uso.
