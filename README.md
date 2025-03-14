# SGRH La Sirena - Backend

Este proyecto es el backend del sistema de gestión de recursos humanos (SGRH) de La Sirena. A continuación, se detallan los pasos para clonar, configurar y ejecutar el proyecto correctamente.

## 📌 Requisitos previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- [Git](https://git-scm.com/downloads)
- [Node.js y npm](https://nodejs.org/)
- [Docker](https://www.docker.com/get-started)
- [Insomnia](https://insomnia.rest/) (opcional, para probar la API)

## 🚀 Instalación y configuración

Sigue estos pasos para configurar y ejecutar el proyecto:

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/TTKarlos/SGRH-La-Sirena-Backend.git
cd SGRH-La-Sirena-Backend
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto y define las variables necesarias. Puedes usar el archivo `.env.example` como referencia.

### 4️⃣ Levantar los contenedores con Docker

Asegúrate de tener Docker instalado y ejecutando, luego ejecuta:
```bash
docker compose up
```
Si necesitas reconstruir los contenedores, usa:
```bash
docker compose up --build
```

### 5️⃣ Ejecutar migraciones de base de datos

Una vez que los contenedores estén en funcionamiento, ejecuta las migraciones para crear las tablas en la base de datos:
```bash
npx sequelize-cli db:migrate
```

### 6️⃣ Ejecutar seeders (datos iniciales)
```bash
npx sequelize-cli db:seed:all
```

### 7️⃣ Probar la API con Insomnia

Importa el archivo `.json` de las peticiones en Insomnia y prueba las rutas disponibles.

## 🛠️ Comandos útiles

- **Apagar los contenedores sin borrar datos**:
  ```bash
  docker compose down
  ```
- **Apagar y borrar los volúmenes (datos de BD incluidos)**:
  ```bash
  docker compose down -v
  ```
- **Ver logs en tiempo real**:
  ```bash
  docker compose logs -f
  ```

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

---

Si tienes alguna duda o sugerencia, no dudes en abrir un issue en el repositorio. ¡Feliz desarrollo! 🚀
