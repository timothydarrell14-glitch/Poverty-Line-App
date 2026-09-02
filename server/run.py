import os

from app import create_app

# Instantiate the application using the factory
app = create_app()

if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug, port=5000, use_reloader=False)
