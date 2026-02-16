# Configuración de Google Calendar API

Para que el sistema pueda crear eventos automáticamente en Google Calendar, necesitamos una **Cuenta de Servicio** de Google.

Sigue estos pasos para obtener las credenciales:

## 1. Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto (ej. "PsychoSystem-Agenda").

## 2. Habilitar la API
1. En el menú, ve a **APIs & Services > Library**.
2. Busca **"Google Calendar API"**.
3. Haz clic en **Enable**.

## 3. Crear Cuenta de Servicio (Service Account)
1. Ve a **APIs & Services > Credentials**.
2. Haz clic en **+ CREATE CREDENTIALS** > **Service Account**.
3. Dale un nombre (ej. "agendador-bot").
4. Dale permisos: **Owner** (o Editor) para facilitar las pruebas.
5. Finaliza la creación.

## 4. Obtener la Clave JSON
1. En la lista de "Service Accounts", haz clic en el email de la cuenta que acabas de crear.
2. Ve a la pestaña **Keys**.
3. **Add Key > Create new key > JSON**.
4. Se descargará un archivo `.json` a tu computadora.

## 5. Integrar en el Proyecto
1. Renombra el archivo descargado a `credentials.json`.
2. Muévelo a la carpeta `backend/` de este proyecto:
   `c:tu_ruta\backend\credentials.json`

## 6. Compartir el Calendario (Importante)
Para que el bot pueda escribir en tu calendario personal:
1. Abre el archivo `credentials.json` y copia el `client_email`.
2. Ve a [Google Calendar](https://calendar.google.com/).
3. En tu calendario, ve a **Configuración y uso compartido**.
4. En **Compartir con personas específicas**, añade el email que copiaste.
5. **Permisos:** Selecciona "Realizar cambios en eventos".

---
Una vez tengas el archivo `backend/credentials.json`, avísame para configurar el backend.
