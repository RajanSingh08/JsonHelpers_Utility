"""
JSON Finder Module - Backend routes for JSON Finder functionality
Rebuilt from scratch to match jsonpathfinder.com functionality
"""
from flask import Blueprint, request, jsonify
import json
from typing import Any

json_finder_bp = Blueprint('json_finder', __name__, url_prefix='/api')


def get_value_at_jsonpath(obj: Any, jsonpath: str) -> Any:
    """
    Get value at a specific JSONPath expression.
    Supports $.path[0].key syntax
    """
    if not jsonpath or jsonpath == "$":
        return obj
    
    # Remove $ prefix
    path = jsonpath[1:] if jsonpath.startswith("$") else jsonpath
    
    if not path:
        return obj
    
    try:
        # Parse the path - handle both .key and [index] syntax
        parts = []
        current = ""
        in_brackets = False
        
        for char in path:
            if char == '[':
                if current:
                    parts.append(current)
                    current = ""
                in_brackets = True
            elif char == ']':
                if in_brackets and current:
                    parts.append(f"[{current}]")
                    current = ""
                in_brackets = False
            elif char == '.' and not in_brackets:
                if current:
                    parts.append(current)
                    current = ""
            else:
                current += char
        
        if current:
            parts.append(current)
        
        # Navigate through the object
        result = obj
        for part in parts:
            if part.startswith('[') and part.endswith(']'):
                # Array index
                index = int(part[1:-1])
                result = result[index]
            else:
                # Object key
                result = result[part]
        
        return result
    except (KeyError, IndexError, ValueError, TypeError):
        return None


@json_finder_bp.route('/validate', methods=['POST'])
def validate_json():
    """Validate JSON and return error if any."""
    try:
        data = request.get_json()
        json_str = data.get('json', '')
        
        if not json_str.strip():
            return jsonify({"valid": False, "error": "Empty JSON"}), 200
        
        json.loads(json_str)
        return jsonify({"valid": True, "error": ""}), 200
    except json.JSONDecodeError as e:
        return jsonify({
            "valid": False,
            "error": f"Invalid JSON at line {e.lineno}: {e.msg}"
        }), 200
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)}), 200


@json_finder_bp.route('/format', methods=['POST'])
def format_json():
    """Returns formatted (pretty) JSON."""
    try:
        data = request.get_json()
        json_str = data.get('json', '')
        
        parsed = json.loads(json_str)
        formatted = json.dumps(parsed, indent=2, ensure_ascii=False)
        return jsonify({"formatted": formatted}), 200
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid JSON: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@json_finder_bp.route('/value', methods=['POST'])
def get_value():
    """Get value at a specific JSONPath."""
    try:
        data = request.get_json()
        json_str = data.get('json', '{}')
        path = data.get('path', '$')
        
        parsed = json.loads(json_str)
        value = get_value_at_jsonpath(parsed, path)
        
        return jsonify({"value": value}), 200
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid JSON: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400
