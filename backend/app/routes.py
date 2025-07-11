from flask import Blueprint, request, jsonify, session
import sqlite3
import hashlib
import json
from datetime import datetime
from models import get_db_connection

main = Blueprint('main', __name__)

# Add CORS headers to all responses
@main.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:8000', 'http://127.0.0.1:8000']:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Handle preflight requests
@main.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = jsonify({'status': 'ok'})
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:8000', 'http://127.0.0.1:8000']:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

def hash_senha(senha):