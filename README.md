
# Poverty-Line-App

## Backend Setup

### Prerequisites
- Python 3.12+
- PostgreSQL installed and running

### 1. Create a virtual environment
```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Create your local database
Open psql as the postgres admin user:
```bash
sudo -u postgres psql
```

Then run:
```sql
CREATE DATABASE poverty_line_db;
CREATE USER poverty_line_user WITH PASSWORD 'changeme123';
GRANT ALL PRIVILEGES ON DATABASE poverty_line_db TO poverty_line_user;
\c poverty_line_db
GRANT ALL ON SCHEMA public TO poverty_line_user;
\q
```

### 3. Create your `.env` file
Create `server/.env` (this file is gitignored, never commit it):


### 4. Apply migrations
```bash
flask --app run db upgrade
```

### 5. Seed the database with sample data
```bash
python seed.py
```

### 6. Run the server
```bash
flask --app run run
```

### Running tests
```bash
pytest tests -v
```
