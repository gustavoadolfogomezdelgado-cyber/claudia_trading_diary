CLAUDIA TRADING DIARY - VERSION PWA CORREGIDA

IMPORTANTE PARA GITHUB/RENDER:
1. Sube LOS ARCHIVOS QUE ESTÁN DENTRO DE ESTA CARPETA directamente a la raíz de tu repositorio.
   server.py, index.html, app.js, styles.css, manifest.webmanifest, sw.js, icons/, etc.
2. En Render usa:
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn server:app
3. En Environment crea CLAUDIA_API_KEY con tu clave privada.
4. Haz Manual Deploy -> Deploy latest commit.

COMPROBACIÓN DESPUÉS DEL DEPLOY:
Abre en Chrome:
https://TU-APP.onrender.com/manifest.webmanifest
https://TU-APP.onrender.com/sw.js
https://TU-APP.onrender.com/icons/icon-192.png
https://TU-APP.onrender.com/icons/icon-512.png
Todas deben abrir sin error 404.

EN ANDROID:
1. Chrome -> abre https://TU-APP.onrender.com/
2. Cierra cualquier acceso directo antiguo de Claudia y borra datos del sitio si una instalación previa falló.
3. Recarga la página.
4. Menú ⋮ -> Instalar aplicación / Añadir a pantalla principal.
