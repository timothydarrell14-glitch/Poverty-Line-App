
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

### Payment configuration
The donation API supports M-Pesa Daraja and PayPal. Keep these values in `server/.env`; never put them in the client environment:

```env
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://your-api.example.com/api/donations/payments/mpesa/callback

PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_CURRENCY=USD
PAYPAL_RETURN_URL=https://your-client.example.com/donors
PAYPAL_CANCEL_URL=https://your-client.example.com/donors
```

M-Pesa updates the donation from the Daraja callback. PayPal creates an order, redirects the donor for approval, and captures the order after the client returns. Payment status must be confirmed by these server-side callbacks; the frontend does not mark a donation as paid.

### Running tests
```bash
pytest tests -v
```
