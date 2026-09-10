# Data2Gain — web pública

Rediseño deportivo premium en HTML, CSS y JavaScript estándar, sin dependencias de producción.

## Copia anterior

`backups/data2gain-antes-rediseno-20260906-202140.zip` contiene 292 archivos de la versión anterior. El `.manifest.json` adjunto incluye sus huellas SHA-256, verificadas antes de editar. El historial `.git` no forma parte del ZIP. También se conserva `Web D2G 03092026`.

Las copias se excluyen del paquete público y de Git, y Apache bloquea su acceso. Para recuperar la versión anterior, descomprime el ZIP en una carpeta vacía y utiliza su contenido web; no mezcles versiones.

## Editar, generar y revisar

- `scripts/build-site.mjs`: fuente de contenido ES/EN y componentes compartidos.
- `css/premium.css`: sistema visual y estilos responsive.
- `js/premium.js`: menú, estrategias, pestañas, comparador y ampliación de capturas.
- `js/demo-data.mjs`: datos ilustrativos; cambiar la referencia no cambia la ronda del jugador.

La raíz, las páginas de `es/` y `en/`, el sitemap y robots son archivos generados. Requiere Node.js 20 o superior:

```powershell
npm run build
npm run check
npm start
```

`scripts/build-locales.ps1` conserva el punto de entrada anterior. La vista previa se sirve desde `dist/` en http://127.0.0.1:4173. La variable `D2G_PORT` permite cambiar el puerto.

## Publicación

Publicar exclusivamente el contenido de `dist/`, incluyendo `.htaccess`. No publicar toda la carpeta del proyecto. No hay despliegue automático en data2gain.com.

Rutas: `/es/`, `/es/jugadores/`, `/es/coaches/`, `/es/informacion/`, `/terminos-y-condiciones/` (también `/es/terminos-y-condiciones/`), y `/en/`, `/en/players/`, `/en/coaches/`, `/en/information/`, `/en/terms/`. Se conservan las redirecciones Apache y Vercel de idioma, `/v2/` y alias de términos.

## Contenido y medición

- Precio publicado de jugador: 8,95 €/mes. Condiciones profesionales por email.
- Las demostraciones están identificadas como ejemplos; no se publican testimonios ni resultados inventados.
- Fotografías: `assets/editorial/CREDITS.md`. Las capturas del producto proceden del proyecto original.
- Fuentes locales: Liberation Sans con licencia adjunta y monoespaciada del sistema, como alternativa disponible a Inter Tight. Se conserva el símbolo original.
- `d2g:interaction` emite eventos locales en `window` con `name`, `locale`, `path` y, cuando corresponde, `strategy`, `feature` o `reference`. No hay proveedor de analítica ni almacenamiento o transmisión de eventos. Un clic hacia la app no equivale a una suscripción.
- La página de información/contacto sustituye los enlaces vacíos. Incorporar los textos legales oficiales del titular cuando estén disponibles: no se han inventado identidades fiscales, direcciones ni condiciones contractuales.
- Los enlaces genéricos a las tiendas se han retirado. Añadir únicamente fichas verificadas de Data2Gain.

## Validación

Las pruebas revisan las nueve páginas públicas, enlaces, recursos, anclas, metadatos, exclusión de copias y estabilidad del comparador. Revisar también escritorio y móvil en el navegador, sin enviar emails ni contratar servicios.
