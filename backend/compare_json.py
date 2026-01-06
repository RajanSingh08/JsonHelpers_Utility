"""
Compare JSON Module - Backend routes for JSON comparison functionality
Handles: diff operations with detailed key-value and schema comparison
"""
from flask import Blueprint, request, jsonify
from deepdiff import DeepDiff
import json
from typing import Any, Dict, List

compare_json_bp = Blueprint('compare_json', __name__, url_prefix='/api/compare')

def get_type_name(obj: Any) -> str:
    """Get type name of an object."""
    if obj is None:
        return 'null'
    if isinstance(obj, bool):
        return 'boolean'
    if isinstance(obj, int):
        return 'integer'
    if isinstance(obj, float):
        return 'number'
    if isinstance(obj, str):
        return 'string'
    if isinstance(obj, list):
        return 'array'
    if isinstance(obj, dict):
        return 'object'
    return str(type(obj).__name__)

def find_line_number_in_json(json_str: str, search_value: Any = None, search_key: str = None) -> int:
    """Find the line number for a given key or value in JSON string."""
    try:
        lines = json_str.split('\n')
        
        # If we have a key, search for it first
        if search_key:
            import re
            key_pattern = re.compile(rf'["\']{re.escape(search_key)}["\']\s*:', re.IGNORECASE)
            for i, line in enumerate(lines):
                if key_pattern.search(line):
                    return i + 1  # Line numbers are 1-based
        
        # Otherwise, try to find by value (for primitives)
        if search_value is not None:
            value_str = f'"{search_value}"' if isinstance(search_value, str) else str(search_value)
            for i, line in enumerate(lines):
                if value_str in line:
                    return i + 1
        
        return 1
    except Exception:
        return 1

def compare_structures(json1: Any, json2: Any, path: str = 'root', json1_str: str = '', json2_str: str = '') -> List[Dict]:
    """Recursively compare two JSON structures and return detailed differences."""
    differences = []
    
    type1 = get_type_name(json1)
    type2 = get_type_name(json2)
    
    # Check for type mismatch
    if type1 != type2:
        line1 = find_line_number_in_json(json1_str, json1, path.split('.')[-1] if path != 'root' else None)
        line2 = find_line_number_in_json(json2_str, json2, path.split('.')[-1] if path != 'root' else None)
        differences.append({
            'path': path,
            'type': 'type_mismatch',
            'json1_type': type1,
            'json2_type': type2,
            'json1_value': json1,
            'json2_value': json2,
            'json1_line': line1,
            'json2_line': line2
        })
        return differences
    
    # Compare objects
    if isinstance(json1, dict) and isinstance(json2, dict):
        all_keys = set(json1.keys()) | set(json2.keys())
        
        for key in all_keys:
            current_path = f"{path}.{key}" if path != 'root' else key
            
            if key not in json1:
                line2 = find_line_number_in_json(json2_str, json2[key], key)
                differences.append({
                    'path': current_path,
                    'type': 'key_missing_in_json1',
                    'key': key,
                    'json2_value': json2[key],
                    'json2_type': get_type_name(json2[key]),
                    'json1_line': None,
                    'json2_line': line2
                })
            elif key not in json2:
                line1 = find_line_number_in_json(json1_str, json1[key], key)
                differences.append({
                    'path': current_path,
                    'type': 'key_missing_in_json2',
                    'key': key,
                    'json1_value': json1[key],
                    'json1_type': get_type_name(json1[key]),
                    'json1_line': line1,
                    'json2_line': None
                })
            else:
                # Both have the key, compare values
                val1 = json1[key]
                val2 = json2[key]
                
                val1_type = get_type_name(val1)
                val2_type = get_type_name(val2)
                
                if val1_type != val2_type:
                    line1 = find_line_number_in_json(json1_str, val1, key)
                    line2 = find_line_number_in_json(json2_str, val2, key)
                    differences.append({
                        'path': current_path,
                        'type': 'value_type_mismatch',
                        'key': key,
                        'json1_type': val1_type,
                        'json2_type': val2_type,
                        'json1_value': val1,
                        'json2_value': val2,
                        'json1_line': line1,
                        'json2_line': line2
                    })
                elif isinstance(val1, (dict, list)):
                    # Recursively compare nested structures
                    differences.extend(compare_structures(val1, val2, current_path, json1_str, json2_str))
                elif val1 != val2:
                    line1 = find_line_number_in_json(json1_str, val1, key)
                    line2 = find_line_number_in_json(json2_str, val2, key)
                    differences.append({
                        'path': current_path,
                        'type': 'value_mismatch',
                        'key': key,
                        'json1_value': val1,
                        'json2_value': val2,
                        'value_type': val1_type,
                        'json1_line': line1,
                        'json2_line': line2
                    })
    
    # Compare arrays
    elif isinstance(json1, list) and isinstance(json2, list):
        max_len = max(len(json1), len(json2))
        
        for i in range(max_len):
            current_path = f"{path}[{i}]"
            
            if i >= len(json1):
                line2 = find_line_number_in_json(json2_str, json2[i], None)
                differences.append({
                    'path': current_path,
                    'type': 'array_item_missing_in_json1',
                    'index': i,
                    'json2_value': json2[i],
                    'json2_type': get_type_name(json2[i]),
                    'json1_line': None,
                    'json2_line': line2
                })
            elif i >= len(json2):
                line1 = find_line_number_in_json(json1_str, json1[i], None)
                differences.append({
                    'path': current_path,
                    'type': 'array_item_missing_in_json2',
                    'index': i,
                    'json1_value': json1[i],
                    'json1_type': get_type_name(json1[i]),
                    'json1_line': line1,
                    'json2_line': None
                })
            else:
                item1 = json1[i]
                item2 = json2[i]
                
                item1_type = get_type_name(item1)
                item2_type = get_type_name(item2)
                
                if item1_type != item2_type:
                    line1 = find_line_number_in_json(json1_str, item1, None)
                    line2 = find_line_number_in_json(json2_str, item2, None)
                    differences.append({
                        'path': current_path,
                        'type': 'array_item_type_mismatch',
                        'index': i,
                        'json1_type': item1_type,
                        'json2_type': item2_type,
                        'json1_value': item1,
                        'json2_value': item2,
                        'json1_line': line1,
                        'json2_line': line2
                    })
                elif isinstance(item1, (dict, list)):
                    differences.extend(compare_structures(item1, item2, current_path, json1_str, json2_str))
                elif item1 != item2:
                    line1 = find_line_number_in_json(json1_str, item1, None)
                    line2 = find_line_number_in_json(json2_str, item2, None)
                    differences.append({
                        'path': current_path,
                        'type': 'array_item_value_mismatch',
                        'index': i,
                        'json1_value': item1,
                        'json2_value': item2,
                        'value_type': item1_type,
                        'json1_line': line1,
                        'json2_line': line2
                    })
    
    # Compare primitive values
    elif json1 != json2:
        line1 = find_line_number_in_json(json1_str, json1, path.split('.')[-1] if path != 'root' else None)
        line2 = find_line_number_in_json(json2_str, json2, path.split('.')[-1] if path != 'root' else None)
        differences.append({
            'path': path,
            'type': 'value_mismatch',
            'json1_value': json1,
            'json2_value': json2,
            'value_type': type1,
            'json1_line': line1,
            'json2_line': line2
        })
    
    return differences

@compare_json_bp.route('/diff', methods=['POST'])
def diff_json():
    """Returns comprehensive JSON diff with detailed key-value and schema comparison."""
    try:
        data = request.get_json()
        json1_str = data.get('json1', '{}')
        json2_str = data.get('json2', '{}')
        
        json1 = json.loads(json1_str)
        json2 = json.loads(json2_str)
        
        # Get detailed structural comparison (pass JSON strings for line number calculation)
        detailed_diffs = compare_structures(json1, json2, 'root', json1_str, json2_str)
        
        # Also use DeepDiff for additional insights
        ddiff = DeepDiff(json1, json2, ignore_order=False, verbose_level=2)
        
        # Convert to serializable format
        diff_result = {
            'detailed': detailed_diffs,
            'summary': {}
        }
        
        # Add DeepDiff results for comprehensive coverage
        if 'dictionary_item_added' in ddiff:
            diff_result['summary']['added'] = list(ddiff['dictionary_item_added'])
        if 'dictionary_item_removed' in ddiff:
            diff_result['summary']['removed'] = list(ddiff['dictionary_item_removed'])
        if 'values_changed' in ddiff:
            diff_result['summary']['changed'] = {
                k: {
                    'old_value': str(v.get('old_value', '')),
                    'new_value': str(v.get('new_value', ''))
                }
                for k, v in ddiff['values_changed'].items()
            }
        if 'iterable_item_added' in ddiff:
            diff_result['summary']['array_added'] = dict(ddiff['iterable_item_added'])
        if 'iterable_item_removed' in ddiff:
            diff_result['summary']['array_removed'] = dict(ddiff['iterable_item_removed'])
        if 'type_changes' in ddiff:
            diff_result['summary']['type_changes'] = {
                k: {
                    'old_type': str(v.get('old_type', '')),
                    'new_type': str(v.get('new_type', ''))
                }
                for k, v in ddiff['type_changes'].items()
            }
        
        return jsonify({"diff": diff_result}), 200
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid JSON: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

