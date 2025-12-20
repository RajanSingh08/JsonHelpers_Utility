"""
Compare JSON Module - Backend routes for JSON comparison functionality
Handles: diff operations
"""
from flask import Blueprint, request, jsonify
from deepdiff import DeepDiff
import json
from typing import Any, Dict

compare_json_bp = Blueprint('compare_json', __name__)

@compare_json_bp.route('/diff', methods=['POST'])
def diff_json():
    """Returns JSON diff using deepdiff."""
    try:
        data = request.get_json()
        json1_str = data.get('json1', '{}')
        json2_str = data.get('json2', '{}')
        
        json1 = json.loads(json1_str)
        json2 = json.loads(json2_str)
        
        ddiff = DeepDiff(json1, json2, ignore_order=False, verbose_level=2)
        
        # Convert to serializable format
        diff_result = {}
        if 'dictionary_item_added' in ddiff:
            diff_result['added'] = list(ddiff['dictionary_item_added'])
        if 'dictionary_item_removed' in ddiff:
            diff_result['removed'] = list(ddiff['dictionary_item_removed'])
        if 'values_changed' in ddiff:
            diff_result['changed'] = {
                k: {
                    'old_value': str(v.get('old_value', '')),
                    'new_value': str(v.get('new_value', ''))
                }
                for k, v in ddiff['values_changed'].items()
            }
        if 'iterable_item_added' in ddiff:
            diff_result['array_added'] = dict(ddiff['iterable_item_added'])
        if 'iterable_item_removed' in ddiff:
            diff_result['array_removed'] = dict(ddiff['iterable_item_removed'])
        
        return jsonify({"diff": diff_result}), 200
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid JSON: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

