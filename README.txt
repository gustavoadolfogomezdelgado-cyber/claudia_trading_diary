CLAUDIA TRADING DIARY
=====================

QUÉ HACE
- Muestra qué pares operaste hoy.
- Ganancia/pérdida por día, semana, mes y total.
- Resumen semanal por par.
- Par más rentable y menos rentable.
- Calendario mensual con resultado de cada día.
- PWA instalable en iPhone/Android.
- Sincroniza operaciones cerradas de MT5 mediante el EA ClaudiaSync.mq5.

IMPORTANTE
Para que el celular se sincronice desde cualquier lugar, la carpeta debe estar alojada en un servidor web público HTTPS.
El archivo render.yaml está preparado para desplegarlo en Render.

PASOS RESUMIDOS
1) Sube esta carpeta a un repositorio GitHub.
2) En Render crea un Web Service usando ese repositorio.
3) Render instalará requirements.txt y arrancará server.py.
4) Define una variable CLAUDIA_API_KEY con una clave larga y privada.
5) Copia la URL pública de Render.
6) En MT5 abre ClaudiaSync.mq5, cambia ServerURL y ApiKey, compila e instala el EA.
7) En MT5: Herramientas > Opciones > Asesores Expertos > Permitir WebRequest y agrega la URL de tu servidor.
8) En el celular abre la URL de Claudia, entra a Configuración, pega la misma URL y la misma clave.
9) iPhone: Compartir > Añadir a pantalla de inicio. Android/Chrome: Instalar aplicación.

NOTA DE HORA
MT5 envía la hora del deal registrada por el terminal/broker. La app agrupa por la fecha recibida. Si deseas forzar UTC-4/Bolivia en todos los brokers, se puede añadir una conversión configurable en una siguiente versión.

SEGURIDAD
No compartas CLAUDIA_API_KEY. La app no necesita la contraseña de tu cuenta MT5.
