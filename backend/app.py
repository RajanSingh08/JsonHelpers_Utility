from flask import Flask
from flask_cors import CORS

# Import blueprints for modular organization
from json_finder import json_finder_bp
from compare_json import compare_json_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Register blueprints
app.register_blueprint(json_finder_bp)  # Already has /api prefix
app.register_blueprint(compare_json_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
