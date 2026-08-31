# Poverty-Line-App

## Local development

1. Create the Flask environment file from the example and adjust the secrets for your machine:
   - `cd server`
   - `cp .env.example .env`
2. Apply database migrations:
   - `flask db upgrade`
3. Create the first admin user:
   - `flask seed-admin`
4. Start the backend:
   - `python run.py`

## Production checklist

- Use a real `SECRET_KEY`, `JWT_SECRET_KEY`, and `ADMIN_PASSWORD` in a production environment file.
- Configure `FRONTEND_URL` or `CORS_ORIGINS` to the exact production client origin; wildcard origins are intentionally disabled.
- Keep the database connection string in a secure environment variable and run migrations before deployment:
  - `flask db upgrade`

## Migration command

Use the standard Alembic migration flow when schema changes are needed:

```bash
cd server
flask db migrate -m "describe change"
flask db upgrade
```
