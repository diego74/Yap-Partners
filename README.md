# YAP Partners

Este es un sitio HTML estático. El dominio `yapcorporation.com` se sirve actualmente desde Namecheap/LiteSpeed; el modo mantenimiento se aplica mediante `.htaccess` y `maintenance.php` en ese mismo servidor. Un cambio en Firestore por sí solo no cambia el sitio hasta que esos archivos estén desplegados.

## Control en Firebase

Proyecto central: `projects-8642b`. Documento: `site_controls/yap`.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `maintenance` | Booleano | `true` muestra mantenimiento; `false` sirve el sitio. |
| `message` | Texto, opcional | Mensaje mostrado cuando está activo. |

Cada petición lee el documento por la API REST de Firestore, sin caché persistente. Las respuestas tienen `Cache-Control: no-store`. Con `true`, las páginas muestran mantenimiento con HTTP 503 y `/api` o `/api/*` responden JSON con HTTP 503. Si el control está configurado pero Firestore no responde, el documento no existe o tiene formato inválido, el sitio queda en mantenimiento. Sin configuración, la vista previa local sirve el sitio normalmente.

No hay credenciales Firebase en el frontend. La lectura usa las reglas existentes para documentos individuales: la lectura pública de `site_controls/apg` y `site_controls/yap` respondió HTTP 200. El repositorio no contiene el archivo de reglas, por lo que la prohibición de escrituras públicas indicada debe verificarse en la consola de Firebase antes del despliegue. No hace falta cambiar las reglas.

## Prueba local

Se necesita PHP 7.4 o superior con la extensión cURL. Desde PowerShell, en la raíz del repositorio:

```powershell
$env:FIREBASE_PROJECT_ID = 'projects-8642b'
$env:SITE_ID = 'yap'
php -S 127.0.0.1:8765 maintenance.php
```

Visita `http://127.0.0.1:8765/` y `http://127.0.0.1:8765/api/example`. Cambia `maintenance` en Firebase entre `true` y `false` y recarga: no se debe reiniciar PHP. Termina con `false`. El servidor integrado de PHP usa `maintenance.php` como enrutador local; `.htaccess` se usa solamente en LiteSpeed.

En este equipo se descargó PHP temporalmente en `.local-tools/` y no se incluye en Git. Si no tienes PHP en `PATH`, puedes usar esa copia local con:

```powershell
$env:FIREBASE_PROJECT_ID = 'projects-8642b'
$env:SITE_ID = 'yap'
$php = '.\.local-tools\php\php.exe'
$ext = (Resolve-Path '.\.local-tools\php\ext').Path
$ca = (Resolve-Path '.\.local-tools\cacert.pem').Path
& $php -d "extension_dir=$ext" -d extension=curl -d "curl.cainfo=$ca" -S 127.0.0.1:8765 maintenance.php
```

La copia portátil de PHP necesita un archivo CA para verificar HTTPS. Se descargó de [curl.se](https://curl.se/docs/caextract.html) a `.local-tools/cacert.pem`. Si falta, descárgalo antes de ejecutar el comando; no desactives la verificación TLS.

## Activación en Namecheap

1. Confirma en cPanel el directorio público exacto de `yapcorporation.com` y revisa si ya existe un `.htaccess` allí. Si existe, integra estas reglas en él en lugar de reemplazarlo.
2. Sube `maintenance.php` y `.htaccess` junto a los archivos HTML y recursos del sitio. En `.htaccess`, `SetEnv FIREBASE_PROJECT_ID projects-8642b` y `SetEnv SITE_ID yap` definen las variables de entorno para PHP; no se necesita `.env` ni credenciales.
3. Verifica que PHP tenga cURL habilitado. Prueba el dominio con `maintenance: true` y `false`, incluidos `/api/example` y un recurso estático. Termina con `maintenance: false`.

Hasta que se suban ambos archivos al directorio público, el dominio seguirá mostrando el sitio normal aunque el documento tenga `maintenance: true`.
