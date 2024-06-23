Instrucciones para Ejecutar el Cliente

- Usamos las tecnologias planteadas en la tarea Elysia, Prisma, Bun, PgAdmin4

Antes de ejecutar client.py, debemos:

- Crear una base de datos en PgAdmin con nombre Tarea2

- Migrar la base de datos con:
	npx prisma migrate dev --name init
	npx prisma generate

- Recordar cambiar contrasena de .env
	DATABASE_URL="postgresql://postgres:"contrasena"@localhost:5432/Tarea2"

- En un terminal diferente a la que se esta ejecutando el servidor:
	cd client
	pip install -r requirements.txt
	python client.py
