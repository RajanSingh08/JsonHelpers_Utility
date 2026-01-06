/**
 * Compare JSON Module - Frontend logic for JSON comparison functionality
 * Handles: JSON comparison, diff display
 */

// State for comparison results
let compareState = {
    diffResult: null,
    comparing: false,
    error: null,
    diffLinesJson1: new Set(), // Line numbers with differences in JSON 1
    diffLinesJson2: new Set()  // Line numbers with differences in JSON 2
};

function renderCompareMode() {
    const bgClass = state.darkMode ? 'bg-gray-800' : 'bg-white';
    const borderClass = state.darkMode ? 'border-gray-700' : 'border-gray-200';
    
    // Determine if results should be shown
    const hasResults = compareState.diffResult || compareState.error || compareState.comparing;
    
    // Check if JSONs are empty
    const json1Empty = !state.json1 || !state.json1.trim() || state.json1 === '{}';
    const json2Empty = !state.json2 || !state.json2.trim() || state.json2 === '{}';
    const bothEmpty = json1Empty && json2Empty;
    const oneEmpty = (json1Empty && !json2Empty) || (!json1Empty && json2Empty);
    
    return `
        <div class="flex flex-col">
            <!-- Main Content: 2-Panel Layout -->
            <div class="grid grid-cols-2" style="height: ${hasResults ? '65vh' : 'calc(100vh - 110px)'}; min-height: 350px; gap: 2px; flex-shrink: 0;">
                <!-- Left Panel: JSON 1 Input -->
                <div class="${bgClass} flex flex-col" style="overflow: hidden; border-right: 1px solid ${state.darkMode ? '#374151' : '#e5e7eb'};">
                    <!-- Header -->
                    <div class="flex items-center justify-center px-3 py-2 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? 'linear-gradient(to right, #1f2937, #111827)' : 'linear-gradient(to right, #f9fafb, #f3f4f6)'};">
                        <h2 class="text-base font-semibold tracking-wide" style="color: ${state.darkMode ? '#f1f5f9' : '#0f172a'};">JSON 1</h2>
                    </div>
                    <!-- Textarea Container with Line Numbers -->
                    <div class="compare-textarea-wrapper" style="flex: 1; min-height: 0; overflow: hidden;">
                        <div id="compare-line-numbers1" class="compare-line-numbers" style="color: ${state.darkMode ? '#6b7280' : '#9ca3af'}; background: ${state.darkMode ? '#1f2937' : '#f3f4f6'}; border-right: 1px solid ${state.darkMode ? '#374151' : '#e5e7eb'};"></div>
                        <div class="compare-textarea-with-lines" style="position: relative; flex: 1; min-height: 0; overflow: hidden;">
                            <textarea 
                                id="compare-textarea1" 
                                class="w-full h-full p-1.5 rounded border font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 2; background: ${state.darkMode ? '#111827' : '#ffffff'}; overflow-x: auto; overflow-y: auto; white-space: pre; word-wrap: normal; overflow-wrap: normal; font-size: 14px; line-height: 1.7; font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace; color: ${state.darkMode ? '#f3f4f6' : '#111827'}; border-color: ${state.darkMode ? '#4b5563' : '#d1d5db'}; border-left: none;"
                                placeholder="Paste your first JSON here or start typing..."
                                oninput="handleCompareInput1(this.value)"
                                onpaste="setTimeout(() => { const ta = document.getElementById('compare-textarea1'); if (ta) { handleCompareInput1(ta.value); syncLineNumbersScroll('compare-textarea1', 'compare-line-numbers1'); } }, 10);"
                                onscroll="syncLineNumbersScroll('compare-textarea1', 'compare-line-numbers1');"
                            ></textarea>
                        </div>
                    </div>
                    <div class="error-container">${state.errors.json1 ? `<div class="px-2 py-1 border-t ${borderClass}" style="flex-shrink: 0;"><div class="p-1 ${state.darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded text-xs">${escapeHtml(state.errors.json1)}</div></div>` : ''}</div>
                </div>
                
                <!-- Right Panel: JSON 2 Input -->
                <div class="${bgClass} flex flex-col" style="overflow: hidden;">
                    <!-- Header -->
                    <div class="flex items-center justify-center px-3 py-2 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? 'linear-gradient(to right, #1f2937, #111827)' : 'linear-gradient(to right, #f9fafb, #f3f4f6)'};">
                        <h2 class="text-base font-semibold tracking-wide" style="color: ${state.darkMode ? '#f1f5f9' : '#0f172a'};">JSON 2</h2>
                    </div>
                    <!-- Textarea Container with Line Numbers -->
                    <div class="compare-textarea-wrapper" style="flex: 1; min-height: 0; overflow: hidden;">
                        <div id="compare-line-numbers2" class="compare-line-numbers" style="color: ${state.darkMode ? '#6b7280' : '#9ca3af'}; background: ${state.darkMode ? '#1f2937' : '#f3f4f6'}; border-right: 1px solid ${state.darkMode ? '#374151' : '#e5e7eb'};"></div>
                        <div class="compare-textarea-with-lines" style="position: relative; flex: 1; min-height: 0; overflow: hidden;">
                            <textarea 
                                id="compare-textarea2" 
                                class="w-full h-full p-1.5 rounded border font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 2; background: ${state.darkMode ? '#111827' : '#ffffff'}; overflow-x: auto; overflow-y: auto; white-space: pre; word-wrap: normal; overflow-wrap: normal; font-size: 14px; line-height: 1.7; font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace; color: ${state.darkMode ? '#f3f4f6' : '#111827'}; border-color: ${state.darkMode ? '#4b5563' : '#d1d5db'}; border-left: none;"
                                placeholder="Paste your second JSON here or start typing..."
                                oninput="handleCompareInput2(this.value)"
                                onpaste="setTimeout(() => { const ta = document.getElementById('compare-textarea2'); if (ta) { handleCompareInput2(ta.value); syncLineNumbersScroll('compare-textarea2', 'compare-line-numbers2'); } }, 10);"
                                onscroll="syncLineNumbersScroll('compare-textarea2', 'compare-line-numbers2');"
                            ></textarea>
                        </div>
                    </div>
                    <div class="error-container">${state.errors.json2 ? `<div class="px-2 py-1 border-t ${borderClass}" style="flex-shrink: 0;"><div class="p-1 ${state.darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded text-xs">${escapeHtml(state.errors.json2)}</div></div>` : ''}</div>
                </div>
            </div>
            
            <!-- Compare Button -->
            <div class="flex justify-center items-center px-2 py-2 border-t ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                <button 
                    id="compare-json-btn"
                    onclick="compareJson()" 
                    class="px-6 py-2 rounded-lg font-semibold text-sm text-white shadow-md transition-all transform hover:scale-105 ${compareState.comparing ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'} active:scale-95"
                    ${compareState.comparing ? 'disabled' : ''}
                >
                    ${compareState.comparing ? '⏳ Comparing...' : '🔍 COMPARE JSON'}
                </button>
            </div>
            
            <!-- Empty JSON Messages -->
            ${bothEmpty && !hasResults ? `
            <div class="border-t ${borderClass}" style="flex-shrink: 0;">
                <div class="px-2 py-2 flex items-center justify-center">
                    <div class="p-2 ${state.darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded text-sm">
                        Please put your JSON in input
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${oneEmpty && !hasResults ? `
            <div class="border-t ${borderClass}" style="flex-shrink: 0;">
                <div class="px-2 py-2 flex items-center justify-center">
                    <div class="p-2 ${state.darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded text-sm">
                        ${json1Empty ? 'Please put JSON to JSON 1' : 'Please put JSON to JSON 2'}
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- Identical Message Banner (shown when identical - replaces results section) -->
            ${compareState.diffResult && compareState.diffResult.isIdentical && !compareState.comparing && !bothEmpty && !json1Empty && !json2Empty ? `
            <div class="border-t ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#065f46' : '#d1fae5'};">
                <div class="px-2 py-1 flex items-center justify-center gap-1">
                    <p class="text-sm font-semibold ${state.darkMode ? 'text-green-200' : 'text-green-800'}">
                        ✓ Both JSON objects are semantically identical
                    </p>
                </div>
            </div>
            ` : ''}
            
            <!-- Results Section (only show if not identical) -->
            ${hasResults && !(compareState.diffResult && compareState.diffResult.isIdentical) ? `
            <div class="border-t ${borderClass}" style="flex-shrink: 0;">
                ${renderCompareResults()}
            </div>
            ` : ''}
        </div>
    `;
}

// Update line numbers for a textarea
// Note: escapeHtml is defined in jsonFinder.js (loaded first) and available globally
function updateLineNumbers(textareaId, lineNumbersId) {
    const textarea = document.getElementById(textareaId);
    const lineNumbersDiv = document.getElementById(lineNumbersId);
    if (!textarea || !lineNumbersDiv) return;
    
    const value = textarea.value || '';
    const lines = value.split('\n');
    const lineCount = Math.max(lines.length, 1);
    
    // Determine which lines have differences
    const isJson1 = textareaId === 'compare-textarea1';
    const diffLines = isJson1 ? compareState.diffLinesJson1 : compareState.diffLinesJson2;
    
    // Build line numbers HTML with yellow background for diff lines
    let lineNumbersHtml = '';
    for (let i = 1; i <= lineCount; i++) {
        if (diffLines.has(i)) {
            // Line with difference - add yellow background
            lineNumbersHtml += `<span class="diff-line-number">${i}</span>\n`;
        } else {
            lineNumbersHtml += i + '\n';
        }
    }
    
    // Update content and sync scroll position
    lineNumbersDiv.innerHTML = lineNumbersHtml;
    lineNumbersDiv.scrollTop = textarea.scrollTop;
}

// Sync line numbers scroll with textarea scroll
function syncLineNumbersScroll(textareaId, lineNumbersId) {
    const textarea = document.getElementById(textareaId);
    const lineNumbersDiv = document.getElementById(lineNumbersId);
    if (!textarea || !lineNumbersDiv) return;
    
    lineNumbersDiv.scrollTop = textarea.scrollTop;
}

// Extract the specific line from JSON string where the difference occurs
function getLineFromJson(jsonStr, lineNumber) {
    if (!jsonStr || !lineNumber || lineNumber < 1) return '';
    
    const lines = jsonStr.split('\n');
    if (lineNumber > lines.length) return '';
    
    // Get the line (0-indexed, so subtract 1)
    const line = lines[lineNumber - 1];
    
    // Trim whitespace but keep the content
    return line.trim();
}

// Format value for display - show only the line if it's a complex object, otherwise show the value
function formatDiffValue(value, jsonStr, lineNumber, isComplex = false) {
    if (isComplex && jsonStr && lineNumber) {
        const line = getLineFromJson(jsonStr, lineNumber);
        if (line) return line;
    }
    
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
        try {
            const str = JSON.stringify(value);
            return str.length > 100 ? str.substring(0, 100) + '...' : str;
        } catch (e) {
            return String(value);
        }
    }
    return String(value);
}

// Find line number by searching for the actual value or key in formatted JSON
function findLineNumberInJson(jsonStr, searchValue, searchKey = null) {
    try {
        const lines = jsonStr.split('\n');
        
        if (searchKey) {
            const keyPattern = new RegExp(`["']${searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\\s*:`, 'i');
            for (let i = 0; i < lines.length; i++) {
                if (keyPattern.test(lines[i])) return i + 1;
            }
        }
        
        if (searchValue !== undefined && searchValue !== null) {
            const valueStr = typeof searchValue === 'string' 
                ? `"${searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`
                : String(searchValue);
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(valueStr)) return i + 1;
            }
        }
        
        return 1;
    } catch (e) {
        return 1;
    }
}

// Helper to clear comparison results
function clearComparisonResults() {
    compareState.diffResult = null;
    compareState.error = null;
    compareState.comparing = false;
    compareState.diffLinesJson1.clear();
    compareState.diffLinesJson2.clear();
}

// Extract line numbers with differences from diff result
function extractDiffLineNumbers(diffResult) {
    compareState.diffLinesJson1.clear();
    compareState.diffLinesJson2.clear();
    
    if (!diffResult || !diffResult.detailed) return;
    
    const detailedDiffs = diffResult.detailed || [];
    detailedDiffs.forEach(diff => {
        if (diff.json1_line) {
            compareState.diffLinesJson1.add(diff.json1_line);
        }
        if (diff.json2_line) {
            compareState.diffLinesJson2.add(diff.json2_line);
        }
    });
    
    // Update line numbers display after extracting diff lines
    setTimeout(() => {
        updateLineNumbers('compare-textarea1', 'compare-line-numbers1');
        updateLineNumbers('compare-textarea2', 'compare-line-numbers2');
    }, 100);
}

function handleCompareInput1(value) {
    state.json1 = value;
    updateLineNumbers('compare-textarea1', 'compare-line-numbers1');
    validateJSON(state.json1, 'json1');
    clearComparisonResults();
}

function handleCompareInput2(value) {
    state.json2 = value;
    updateLineNumbers('compare-textarea2', 'compare-line-numbers2');
    validateJSON(state.json2, 'json2');
    clearComparisonResults();
}

// Helper function to normalize JSON for semantic comparison
function normalizeJson(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(normalizeJson);
    }
    
    // For objects, sort keys and recursively normalize values
    const sortedKeys = Object.keys(obj).sort();
    const normalized = {};
    for (const key of sortedKeys) {
        normalized[key] = normalizeJson(obj[key]);
    }
    return normalized;
}

// Helper function to check if two JSON objects are semantically identical
function areJsonSemanticallyIdentical(json1, json2) {
    try {
        const obj1 = JSON.parse(json1);
        const obj2 = JSON.parse(json2);
        
        // Normalize both JSONs recursively
        const normalized1 = normalizeJson(obj1);
        const normalized2 = normalizeJson(obj2);
        
        // Compare normalized JSONs
        return JSON.stringify(normalized1) === JSON.stringify(normalized2);
    } catch (e) {
        return false;
    }
}

// Helper to get type name
function getTypeName(obj) {
    if (obj === null) return 'null';
    if (Array.isArray(obj)) return 'array';
    return typeof obj;
}

// Client-side comparison function (fallback when backend is unavailable)
function compareJsonClientSide(json1Str, json2Str) {
    try {
        const json1 = JSON.parse(json1Str);
        const json2 = JSON.parse(json2Str);
        
        const detailed = [];
        
        function compareStructures(obj1, obj2, path = 'root', json1Str = '', json2Str = '') {
            const type1 = getTypeName(obj1);
            const type2 = getTypeName(obj2);
            
            // Type mismatch
            if (type1 !== type2) {
                const line1 = findLineNumberInJson(json1Str, obj1, path === 'root' ? null : path.split('.').pop());
                const line2 = findLineNumberInJson(json2Str, obj2, path === 'root' ? null : path.split('.').pop());
                detailed.push({
                    path: path,
                    type: 'type_mismatch',
                    json1_type: type1,
                    json2_type: type2,
                    json1_value: obj1,
                    json2_value: obj2,
                    json1_line: line1,
                    json2_line: line2
                });
                return;
            }
            
            // Compare objects
            if (type1 === 'object' && obj1 !== null && obj2 !== null) {
                const keys1 = new Set(Object.keys(obj1));
                const keys2 = new Set(Object.keys(obj2));
                const allKeys = new Set([...keys1, ...keys2]);
                
                for (const key of allKeys) {
                    const currentPath = path === 'root' ? key : `${path}.${key}`;
                    
                    if (!keys1.has(key)) {
                        const line2 = findLineNumberInJson(json2Str, obj2[key], key);
                        detailed.push({
                            path: currentPath,
                            type: 'key_missing_in_json1',
                            key: key,
                            json2_value: obj2[key],
                            json2_type: getTypeName(obj2[key]),
                            json1_line: null,
                            json2_line: line2
                        });
                    } else if (!keys2.has(key)) {
                        const line1 = findLineNumberInJson(json1Str, obj1[key], key);
                        detailed.push({
                            path: currentPath,
                            type: 'key_missing_in_json2',
                            key: key,
                            json1_value: obj1[key],
                            json1_type: getTypeName(obj1[key]),
                            json1_line: line1,
                            json2_line: null
                        });
                    } else {
                        const val1 = obj1[key];
                        const val2 = obj2[key];
                        const val1Type = getTypeName(val1);
                        const val2Type = getTypeName(val2);
                        
                        if (val1Type !== val2Type) {
                            const line1 = findLineNumberInJson(json1Str, val1, key);
                            const line2 = findLineNumberInJson(json2Str, val2, key);
                            detailed.push({
                                path: currentPath,
                                type: 'value_type_mismatch',
                                key: key,
                                json1_type: val1Type,
                                json2_type: val2Type,
                                json1_value: val1,
                                json2_value: val2,
                                json1_line: line1,
                                json2_line: line2
                            });
                        } else if (val1Type === 'object' || val1Type === 'array') {
                            compareStructures(val1, val2, currentPath, json1Str, json2Str);
                        } else if (val1 !== val2) {
                            const line1 = findLineNumberInJson(json1Str, val1, key);
                            const line2 = findLineNumberInJson(json2Str, val2, key);
                            detailed.push({
                                path: currentPath,
                                type: 'value_mismatch',
                                key: key,
                                json1_value: val1,
                                json2_value: val2,
                                value_type: val1Type,
                                json1_line: line1,
                                json2_line: line2
                            });
                        }
                    }
                }
            }
            // Compare arrays
            else if (type1 === 'array') {
                const maxLen = Math.max(obj1.length, obj2.length);
                for (let i = 0; i < maxLen; i++) {
                    const currentPath = `${path}[${i}]`;
                    if (i >= obj1.length) {
                        const line2 = findLineNumberInJson(json2Str, obj2[i], null);
                        detailed.push({
                            path: currentPath,
                            type: 'array_item_missing_in_json1',
                            index: i,
                            json2_value: obj2[i],
                            json2_type: getTypeName(obj2[i]),
                            json1_line: null,
                            json2_line: line2
                        });
                    } else if (i >= obj2.length) {
                        const line1 = findLineNumberInJson(json1Str, obj1[i], null);
                        detailed.push({
                            path: currentPath,
                            type: 'array_item_missing_in_json2',
                            index: i,
                            json1_value: obj1[i],
                            json1_type: getTypeName(obj1[i]),
                            json1_line: line1,
                            json2_line: null
                        });
                    } else {
                        const item1 = obj1[i];
                        const item2 = obj2[i];
                        const item1Type = getTypeName(item1);
                        const item2Type = getTypeName(item2);
                        
                        if (item1Type !== item2Type) {
                            const line1 = findLineNumberInJson(json1Str, item1, null);
                            const line2 = findLineNumberInJson(json2Str, item2, null);
                            detailed.push({
                                path: currentPath,
                                type: 'array_item_type_mismatch',
                                index: i,
                                json1_type: item1Type,
                                json2_type: item2Type,
                                json1_value: item1,
                                json2_value: item2,
                                json1_line: line1,
                                json2_line: line2
                            });
                        } else if (item1Type === 'object' || item1Type === 'array') {
                            compareStructures(item1, item2, currentPath, json1Str, json2Str);
                        } else if (item1 !== item2) {
                            const line1 = findLineNumberInJson(json1Str, item1, null);
                            const line2 = findLineNumberInJson(json2Str, item2, null);
                            detailed.push({
                                path: currentPath,
                                type: 'array_item_value_mismatch',
                                index: i,
                                json1_value: item1,
                                json2_value: item2,
                                value_type: item1Type,
                                json1_line: line1,
                                json2_line: line2
                            });
                        }
                    }
                }
            }
            // Compare primitives
            else if (obj1 !== obj2) {
                const line1 = findLineNumberInJson(json1Str, obj1, path === 'root' ? null : path.split('.').pop());
                const line2 = findLineNumberInJson(json2Str, obj2, path === 'root' ? null : path.split('.').pop());
                detailed.push({
                    path: path,
                    type: 'value_mismatch',
                    json1_value: obj1,
                    json2_value: obj2,
                    value_type: type1,
                    json1_line: line1,
                    json2_line: line2
                });
            }
        }
        
        compareStructures(json1, json2, 'root', json1Str, json2Str);
        
        return {
            detailed: detailed,
            summary: {}
        };
    } catch (e) {
        throw new Error(`Client-side comparison failed: ${e.message}`);
    }
}

async function compareJson() {
    // Validate both JSONs first
    if (state.errors.json1 || state.errors.json2) {
        compareState.error = 'Please fix JSON errors before comparing.';
        compareState.diffResult = null;
        render();
        return;
    }
    
    if (!state.json1 || !state.json1.trim() || !state.json2 || !state.json2.trim()) {
        compareState.error = 'Both JSON inputs are required.';
        compareState.diffResult = null;
        render();
        return;
    }
    
    // Validate JSON parsing
    let parsedJson1, parsedJson2;
    try {
        parsedJson1 = JSON.parse(state.json1);
        parsedJson2 = JSON.parse(state.json2);
    } catch (e) {
        compareState.error = `Invalid JSON: ${e.message}`;
        compareState.diffResult = null;
        render();
        return;
    }
    
    // Check if both JSONs have actual content (not just empty objects or whitespace)
    const json1HasContent = state.json1 && state.json1.trim() && state.json1.trim() !== '{}';
    const json2HasContent = state.json2 && state.json2.trim() && state.json2.trim() !== '{}';
    
    if (!json1HasContent || !json2HasContent) {
        compareState.error = 'Both JSON inputs are required.';
        compareState.diffResult = null;
        compareState.comparing = false;
        render();
        return;
    }
    
    // Check if semantically identical first
    const isSemanticallyIdentical = areJsonSemanticallyIdentical(state.json1, state.json2);
    
    compareState.comparing = true;
    compareState.error = null;
    render();
    
    // If identical, skip backend call
    if (isSemanticallyIdentical) {
        compareState.diffResult = { isIdentical: true };
        compareState.comparing = false;
        render();
        return;
    }
    
    // Try backend first, fallback to client-side
    let timeoutId = null;
    try {
        // Create timeout controller for fetch
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_BASE}/api/compare/diff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                json1: state.json1,
                json2: state.json2
            }),
            signal: controller.signal
        });
        
        if (timeoutId) clearTimeout(timeoutId);
        
        if (!response.ok) {
            let errorMessage = `Server error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        compareState.diffResult = data.diff;
        compareState.error = null;
        extractDiffLineNumbers(data.diff);
    } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        
        // If backend fails, use client-side comparison
        if ((error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) || 
            error.name === 'AbortError' || error.message.includes('aborted') ||
            error.message.includes('network') || error.message.includes('NetworkError')) {
            console.warn('Backend unavailable, using client-side comparison');
            try {
                // Use client-side comparison as fallback
                compareState.diffResult = compareJsonClientSide(state.json1, state.json2);
                compareState.error = null;
                extractDiffLineNumbers(compareState.diffResult);
                // Show a subtle notice that client-side comparison was used
                console.info('Comparison completed using client-side fallback');
            } catch (clientError) {
                compareState.error = `Comparison failed: ${clientError.message}. Please ensure both JSONs are valid.`;
                compareState.diffResult = null;
            }
        } else {
            // For other errors, try client-side comparison as fallback
            console.warn('Backend error, attempting client-side comparison');
            try {
                compareState.diffResult = compareJsonClientSide(state.json1, state.json2);
                compareState.error = null;
                extractDiffLineNumbers(compareState.diffResult);
            } catch (clientError) {
                compareState.error = `Failed to compare JSONs: ${error.message || 'Unknown error'}. Client-side fallback also failed: ${clientError.message}`;
                compareState.diffResult = null;
            }
        }
        console.error('Compare JSON error:', error);
    } finally {
        compareState.comparing = false;
        render();
    }
}

function renderCompareResults() {
    // Get the original JSON strings for line extraction
    const json1Str = state.json1 || '';
    const json2Str = state.json2 || '';
    
    if (compareState.comparing) {
        return `
            <div class="${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'} p-2">
                <div class="text-center text-xs ${state.darkMode ? 'text-gray-300' : 'text-gray-600'}">
                    <p>Comparing JSONs...</p>
                </div>
            </div>
        `;
    }
    
    if (compareState.error) {
        return `
            <div class="${state.darkMode ? 'bg-red-900' : 'bg-red-100'} rounded border ${state.darkMode ? 'border-red-700' : 'border-red-400'} p-2">
                <h3 class="text-sm font-semibold mb-1 ${state.darkMode ? 'text-red-200' : 'text-red-800'}">Error</h3>
                <p class="text-xs ${state.darkMode ? 'text-red-200' : 'text-red-700'}">${escapeHtml(compareState.error)}</p>
            </div>
        `;
    }
    
    if (!compareState.diffResult) {
        return '';
    }
    
    const diff = compareState.diffResult;
    
    // Check if we have detailed differences
    const detailedDiffs = diff.detailed || [];
    const summary = diff.summary || diff;
    
    // Check for changes in both detailed and summary
    const hasChanges = detailedDiffs.length > 0 ||
                      (summary.added && summary.added.length > 0) ||
                      (summary.removed && summary.removed.length > 0) ||
                      (summary.changed && Object.keys(summary.changed).length > 0) ||
                      (summary.array_added && Object.keys(summary.array_added).length > 0) ||
                      (summary.array_removed && Object.keys(summary.array_removed).length > 0);
    
    if (!hasChanges) {
    return `
            <div class="${state.darkMode ? 'bg-green-900' : 'bg-green-100'} rounded border ${state.darkMode ? 'border-green-700' : 'border-green-400'} p-2">
                <div class="flex items-center gap-1 mb-1">
                    <svg class="w-4 h-4 ${state.darkMode ? 'text-green-300' : 'text-green-700'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-sm font-semibold ${state.darkMode ? 'text-green-200' : 'text-green-800'}">No Differences Found</h3>
                </div>
                <p class="text-xs ${state.darkMode ? 'text-green-200' : 'text-green-700'}">Both JSON objects are structurally identical.</p>
            </div>
        `;
    }
    
    // Calculate statistics from detailed differences
    const stats = {
        typeMismatches: detailedDiffs.filter(d => d.type === 'type_mismatch' || d.type === 'value_type_mismatch' || d.type === 'array_item_type_mismatch').length,
        missingKeys: detailedDiffs.filter(d => d.type === 'key_missing_in_json1' || d.type === 'key_missing_in_json2').length,
        valueMismatches: detailedDiffs.filter(d => d.type === 'value_mismatch' || d.type === 'array_item_value_mismatch').length,
        arrayIssues: detailedDiffs.filter(d => d.type.includes('array_item')).length,
        added: summary.added ? summary.added.length : 0,
        removed: summary.removed ? summary.removed.length : 0,
        changed: summary.changed ? Object.keys(summary.changed).length : 0
    };
    const totalChanges = detailedDiffs.length || (stats.added + stats.removed + stats.changed);
    
    let resultsHtml = `
        <div class="p-1" style="min-height: 20vh; background-color: ${state.darkMode ? '#1e293b' : '#f8fafc'};">
            <div class="flex items-center mb-1 flex-wrap gap-1">
                <div class="flex-1"></div>
                <div class="flex-1 text-center">
                    <h3 class="text-sm font-semibold" style="color: ${state.darkMode ? '#f1f5f9' : '#0f172a'};">Detailed Comparison Results</h3>
                </div>
                <div class="flex-1 flex items-center justify-end gap-1 text-xs flex-wrap">
                    ${stats.typeMismatches > 0 ? `<span class="${state.darkMode ? 'text-gray-400' : 'text-gray-600'}">
                        <span class="font-semibold ${state.darkMode ? 'text-purple-400' : 'text-purple-600'}">${stats.typeMismatches}</span> type mismatch${stats.typeMismatches !== 1 ? 'es' : ''}
                    </span>` : ''}
                    ${stats.missingKeys > 0 ? `<span class="${state.darkMode ? 'text-gray-400' : 'text-gray-600'}">
                        <span class="font-semibold ${state.darkMode ? 'text-orange-400' : 'text-orange-600'}">${stats.missingKeys}</span> missing key${stats.missingKeys !== 1 ? 's' : ''}
                    </span>` : ''}
                    ${stats.valueMismatches > 0 ? `<span class="${state.darkMode ? 'text-gray-400' : 'text-gray-600'}">
                        <span class="font-semibold ${state.darkMode ? 'text-yellow-400' : 'text-yellow-600'}">${stats.valueMismatches}</span> value mismatch${stats.valueMismatches !== 1 ? 'es' : ''}
                    </span>` : ''}
                    ${stats.added > 0 ? `<span class="${state.darkMode ? 'text-gray-400' : 'text-gray-600'}">
                        <span class="font-semibold ${state.darkMode ? 'text-green-400' : 'text-green-600'}">${stats.added}</span> added
                    </span>` : ''}
                    ${stats.removed > 0 ? `<span class="${state.darkMode ? 'text-gray-400' : 'text-gray-600'}">
                        <span class="font-semibold ${state.darkMode ? 'text-red-400' : 'text-red-600'}">${stats.removed}</span> removed
                    </span>` : ''}
                    <span class="${state.darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold">
                        Total: ${totalChanges} difference${totalChanges !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
    `;
    
    // Separate missing keys and value mismatches from other differences
    const missingKeysJson1 = detailedDiffs.filter(d => d.type === 'key_missing_in_json1');
    const missingKeysJson2 = detailedDiffs.filter(d => d.type === 'key_missing_in_json2');
    const valueMismatches = detailedDiffs.filter(d => d.type === 'value_mismatch' || d.type === 'array_item_value_mismatch');
    const otherDiffs = detailedDiffs.filter(d => 
        d.type !== 'key_missing_in_json1' && 
        d.type !== 'key_missing_in_json2' && 
        d.type !== 'value_mismatch' && 
        d.type !== 'array_item_value_mismatch'
    );
    
    // Display Missing Keys section with two partitions if there are any
    if (missingKeysJson1.length > 0 || missingKeysJson2.length > 0) {
        resultsHtml += `
            <div class="mb-1">
                <h4 class="text-xs font-semibold mb-0.5" style="color: ${state.darkMode ? '#f1f5f9' : '#0f172a'};">Missing Keys</h4>
                <div class="grid grid-cols-2 gap-1">
                    <!-- JSON 1 Missing Keys -->
                    <div class="${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-1 border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}">
                        <h5 class="text-xs font-semibold ${state.darkMode ? 'text-red-300' : 'text-red-700'} mb-0.5">Keys Missing in JSON 1 (${missingKeysJson1.length})</h5>
                        ${missingKeysJson1.length > 0 ? `
                            <div class="space-y-0.5">
                                ${missingKeysJson1.map((diffItem, idx) => `
                                    <div class="text-xs ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded p-0.5 border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}">
                                        <div class="font-semibold mb-0.5">Path: <code class="px-0.5 py-0 rounded">${escapeHtml(diffItem.path)}</code></div>
                                        <div class="mb-0.5">Key: <code class="px-0.5 py-0 rounded">${escapeHtml(diffItem.key)}</code></div>
                                        ${diffItem.json2_line ? `<div class="${state.darkMode ? 'text-green-300' : 'text-green-600'}">Found in JSON 2 Line ${diffItem.json2_line}: <code class="px-0.5 py-0 rounded font-mono">${escapeHtml(getLineFromJson(json2Str, diffItem.json2_line) || formatDiffValue(diffItem.json2_value, json2Str, diffItem.json2_line, true))}</code></div>` : `<div class="${state.darkMode ? 'text-green-300' : 'text-green-600'}">Found in JSON 2: <code class="px-0.5 py-0 rounded">${escapeHtml(formatDiffValue(diffItem.json2_value, json2Str, null, false))}</code></div>`}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-1">No keys missing in JSON 1</div>
                        `}
                    </div>
                    
                    <!-- JSON 2 Missing Keys -->
                    <div class="${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-1 border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}">
                        <h5 class="text-xs font-semibold ${state.darkMode ? 'text-green-300' : 'text-green-700'} mb-0.5">Keys Missing in JSON 2 (${missingKeysJson2.length})</h5>
                        ${missingKeysJson2.length > 0 ? `
                            <div class="space-y-0.5">
                                ${missingKeysJson2.map((diffItem, idx) => `
                                    <div class="text-xs ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded p-0.5 border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}">
                                        <div class="font-semibold mb-0.5">Path: <code class="px-0.5 py-0 rounded">${escapeHtml(diffItem.path)}</code></div>
                                        <div class="mb-0.5">Key: <code class="px-0.5 py-0 rounded">${escapeHtml(diffItem.key)}</code></div>
                                        ${diffItem.json1_line ? `<div class="${state.darkMode ? 'text-red-300' : 'text-red-600'}">Found in JSON 1 Line ${diffItem.json1_line}: <code class="px-0.5 py-0 rounded font-mono">${escapeHtml(getLineFromJson(json1Str, diffItem.json1_line) || formatDiffValue(diffItem.json1_value, json1Str, diffItem.json1_line, true))}</code></div>` : `<div class="${state.darkMode ? 'text-red-300' : 'text-red-600'}">Found in JSON 1: <code class="px-0.5 py-0 rounded">${escapeHtml(formatDiffValue(diffItem.json1_value, json1Str, null, false))}</code></div>`}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-1">No keys missing in JSON 2</div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Display Value Mismatches section with two partitions if there are any
    if (valueMismatches.length > 0) {
        resultsHtml += `
            <div class="mb-1">
                <h4 class="text-xs font-semibold mb-0.5" style="color: ${state.darkMode ? '#f1f5f9' : '#0f172a'};">Value Mismatches</h4>
                <div class="grid grid-cols-2 gap-1">
                    <!-- JSON 1 Value Mismatches -->
                    <div class="${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-1 border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}">
                        <h5 class="text-xs font-semibold ${state.darkMode ? 'text-red-300' : 'text-red-700'} mb-0.5">JSON 1 Values (${valueMismatches.length})</h5>
                        <div class="space-y-0.5">
                            ${valueMismatches.map((diffItem, idx) => `
                                <div class="text-xs ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded p-0.5 border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}">
                                    <div class="font-semibold mb-0.5">Path: <code class="px-0.5 py-0 rounded">${escapeHtml(diffItem.path)}</code></div>
                                    ${diffItem.key ? `<div class="mb-0.5">Key: <code class="px-0.5 py-0 rounded">${escapeHtml(diffItem.key)}</code></div>` : ''}
                                    ${diffItem.index !== undefined ? `<div class="mb-0.5">Index: ${diffItem.index}</div>` : ''}
                                    ${diffItem.json1_line ? `<div class="${state.darkMode ? 'text-red-300' : 'text-red-600'}">Line ${diffItem.json1_line} (<span class="font-mono">${escapeHtml(diffItem.value_type || 'unknown')}</span>): <code class="px-0.5 py-0 rounded font-mono">${escapeHtml(getLineFromJson(json1Str, diffItem.json1_line) || formatDiffValue(diffItem.json1_value, json1Str, diffItem.json1_line, true))}</code></div>` : `<div class="${state.darkMode ? 'text-red-300' : 'text-red-600'}">Value (<span class="font-mono">${escapeHtml(diffItem.value_type || 'unknown')}</span>): <code class="px-0.5 py-0 rounded">${escapeHtml(formatDiffValue(diffItem.json1_value, json1Str, null, false))}</code></div>`}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- JSON 2 Value Mismatches -->
                    <div class="${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-1 border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}">
                        <h5 class="text-xs font-semibold ${state.darkMode ? 'text-green-300' : 'text-green-700'} mb-0.5">JSON 2 Values (${valueMismatches.length})</h5>
                        <div class="space-y-0.5">
                            ${valueMismatches.map((diffItem, idx) => `
                                <div class="text-xs ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded p-0.5 border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}">
                                    <div class="font-semibold mb-0.5">Path: <code class="px-0.5 py-0 rounded">${escapeHtml(diffItem.path)}</code></div>
                                    ${diffItem.key ? `<div class="mb-0.5">Key: <code class="px-0.5 py-0 rounded">${escapeHtml(diffItem.key)}</code></div>` : ''}
                                    ${diffItem.index !== undefined ? `<div class="mb-0.5">Index: ${diffItem.index}</div>` : ''}
                                    ${diffItem.json2_line ? `<div class="${state.darkMode ? 'text-green-300' : 'text-green-600'}">Line ${diffItem.json2_line} (<span class="font-mono">${escapeHtml(diffItem.value_type || 'unknown')}</span>): <code class="px-0.5 py-0 rounded font-mono">${escapeHtml(getLineFromJson(json2Str, diffItem.json2_line) || formatDiffValue(diffItem.json2_value, json2Str, diffItem.json2_line, true))}</code></div>` : `<div class="${state.darkMode ? 'text-green-300' : 'text-green-600'}">Value (<span class="font-mono">${escapeHtml(diffItem.value_type || 'unknown')}</span>): <code class="px-0.5 py-0 rounded">${escapeHtml(formatDiffValue(diffItem.json2_value, json2Str, null, false))}</code></div>`}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Display other differences in a single list
    resultsHtml += `<div class="space-y-1.5">`;
    
    if (otherDiffs.length > 0) {
        otherDiffs.forEach((diffItem, index) => {
            const diffBg = state.darkMode ? 'bg-gray-900' : 'bg-gray-50';
            const diffBorder = state.darkMode ? 'border-gray-700' : 'border-gray-200';
            
            let diffColor = state.darkMode ? 'text-yellow-300' : 'text-yellow-700';
            let diffTitle = 'Difference';
            let diffContent = '';
            
            switch(diffItem.type) {
                case 'type_mismatch':
                    diffColor = state.darkMode ? 'text-purple-300' : 'text-purple-700';
                    diffTitle = 'Type Mismatch';
                    diffContent = `
                        <div class="text-xs">
                            <div class="mb-0.5"><span class="font-semibold">Path:</span> <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded">${escapeHtml(diffItem.path)}</code></div>
                            ${diffItem.json1_line ? `<div class="mb-0.5 ${state.darkMode ? 'text-red-300' : 'text-red-600'}">JSON 1 Type: <span class="font-mono">${escapeHtml(diffItem.json1_type)}</span> <span class="text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}">(Line ${diffItem.json1_line})</span></div>` : `<div class="mb-0.5 ${state.darkMode ? 'text-red-300' : 'text-red-600'}">JSON 1 Type: <span class="font-mono">${escapeHtml(diffItem.json1_type)}</span></div>`}
                            ${diffItem.json2_line ? `<div class="mb-0.5 ${state.darkMode ? 'text-green-300' : 'text-green-600'}">JSON 2 Type: <span class="font-mono">${escapeHtml(diffItem.json2_type)}</span> <span class="text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}">(Line ${diffItem.json2_line})</span></div>` : `<div class="mb-0.5 ${state.darkMode ? 'text-green-300' : 'text-green-600'}">JSON 2 Type: <span class="font-mono">${escapeHtml(diffItem.json2_type)}</span></div>`}
                            ${diffItem.json1_line ? `<div class="mt-1 text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-600'}">
                                JSON 1 Line ${diffItem.json1_line}: <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded font-mono">${escapeHtml(getLineFromJson(json1Str, diffItem.json1_line) || formatDiffValue(diffItem.json1_value, json1Str, diffItem.json1_line, true))}</code>
                            </div>` : ''}
                            ${diffItem.json2_line ? `<div class="text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-600'}">
                                JSON 2 Line ${diffItem.json2_line}: <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded font-mono">${escapeHtml(getLineFromJson(json2Str, diffItem.json2_line) || formatDiffValue(diffItem.json2_value, json2Str, diffItem.json2_line, true))}</code>
                            </div>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'value_type_mismatch':
                case 'array_item_type_mismatch':
                    diffColor = state.darkMode ? 'text-purple-300' : 'text-purple-700';
                    diffTitle = 'Value Type Mismatch';
                    diffContent = `
                        <div class="text-xs">
                            <div class="mb-0.5"><span class="font-semibold">Path:</span> <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded">${escapeHtml(diffItem.path)}</code></div>
                            ${diffItem.key ? `<div class="mb-0.5"><span class="font-semibold">Key:</span> <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded">${escapeHtml(diffItem.key)}</code></div>` : ''}
                            ${diffItem.index !== undefined ? `<div class="mb-0.5"><span class="font-semibold">Index:</span> ${diffItem.index}</div>` : ''}
                            ${diffItem.json1_line ? `<div class="mb-0.5 ${state.darkMode ? 'text-red-300' : 'text-red-600'}">JSON 1 Line ${diffItem.json1_line}: <span class="font-mono">${escapeHtml(diffItem.json1_type)}</span> = <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded">${escapeHtml(getLineFromJson(json1Str, diffItem.json1_line) || formatDiffValue(diffItem.json1_value, json1Str, diffItem.json1_line, true))}</code></div>` : `<div class="mb-0.5 ${state.darkMode ? 'text-red-300' : 'text-red-600'}">JSON 1 Type: <span class="font-mono">${escapeHtml(diffItem.json1_type)}</span> = <code>${escapeHtml(formatDiffValue(diffItem.json1_value, json1Str, null, false))}</code></div>`}
                            ${diffItem.json2_line ? `<div class="mb-0.5 ${state.darkMode ? 'text-green-300' : 'text-green-600'}">JSON 2 Line ${diffItem.json2_line}: <span class="font-mono">${escapeHtml(diffItem.json2_type)}</span> = <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded">${escapeHtml(getLineFromJson(json2Str, diffItem.json2_line) || formatDiffValue(diffItem.json2_value, json2Str, diffItem.json2_line, true))}</code></div>` : `<div class="mb-0.5 ${state.darkMode ? 'text-green-300' : 'text-green-600'}">JSON 2 Type: <span class="font-mono">${escapeHtml(diffItem.json2_type)}</span> = <code>${escapeHtml(formatDiffValue(diffItem.json2_value, json2Str, null, false))}</code></div>`}
                        </div>
                    `;
                    break;
                    
                case 'array_item_missing_in_json1':
                case 'array_item_missing_in_json2':
                    diffColor = state.darkMode ? 'text-orange-300' : 'text-orange-700';
                    diffTitle = diffItem.type === 'array_item_missing_in_json1' ? 'Array Item Missing in JSON 1' : 'Array Item Missing in JSON 2';
                    diffContent = `
                        <div class="text-xs">
                            <div class="mb-0.5"><span class="font-semibold">Path:</span> <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded">${escapeHtml(diffItem.path)}</code></div>
                            <div class="mb-0.5"><span class="font-semibold">Index:</span> ${diffItem.index}</div>
                            ${diffItem.json1_value !== undefined ? `
                                ${diffItem.json1_line ? `<div class="mb-0.5 ${state.darkMode ? 'text-red-300' : 'text-red-600'}">Found in JSON 1 Line ${diffItem.json1_line}: <span class="font-mono">${escapeHtml(diffItem.json1_type)}</span> = <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded">${escapeHtml(getLineFromJson(json1Str, diffItem.json1_line) || formatDiffValue(diffItem.json1_value, json1Str, diffItem.json1_line, true))}</code></div>` : `<div class="mb-0.5 ${state.darkMode ? 'text-red-300' : 'text-red-600'}">Found in JSON 1: <span class="font-mono">${escapeHtml(diffItem.json1_type)}</span> = <code>${escapeHtml(formatDiffValue(diffItem.json1_value, json1Str, null, false))}</code></div>`}
                            ` : ''}
                            ${diffItem.json2_value !== undefined ? `
                                ${diffItem.json2_line ? `<div class="mb-0.5 ${state.darkMode ? 'text-green-300' : 'text-green-600'}">Found in JSON 2 Line ${diffItem.json2_line}: <span class="font-mono">${escapeHtml(diffItem.json2_type)}</span> = <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded">${escapeHtml(getLineFromJson(json2Str, diffItem.json2_line) || formatDiffValue(diffItem.json2_value, json2Str, diffItem.json2_line, true))}</code></div>` : `<div class="mb-0.5 ${state.darkMode ? 'text-green-300' : 'text-green-600'}">Found in JSON 2: <span class="font-mono">${escapeHtml(diffItem.json2_type)}</span> = <code>${escapeHtml(formatDiffValue(diffItem.json2_value, json2Str, null, false))}</code></div>`}
                            ` : ''}
                        </div>
                    `;
                    break;
                    
                default:
                    diffContent = `
                        <div class="text-xs">
                            <div class="mb-0.5"><span class="font-semibold">Path:</span> <code class="px-0.5 py-0 ${state.darkMode ? 'bg-gray-800' : 'bg-white'} rounded">${escapeHtml(diffItem.path)}</code></div>
                            <div class="mb-0.5">Type: <code>${escapeHtml(diffItem.type)}</code></div>
                            <pre class="text-xs mt-1 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}">${escapeHtml(JSON.stringify(diffItem, null, 2))}</pre>
                        </div>
                    `;
            }
            
            resultsHtml += `
                <div class="${diffBg} rounded p-1 border ${diffBorder}">
                    <div class="flex items-center gap-1 mb-0.5">
                        <span class="text-xs font-semibold px-0.5 py-0 rounded ${diffColor} ${state.darkMode ? 'bg-gray-800' : 'bg-white'}">${index + 1}</span>
                        <h5 class="text-xs font-semibold ${diffColor}">${diffTitle}</h5>
                    </div>
                    ${diffContent}
                </div>
            `;
        });
    }
    
    resultsHtml += `
            </div>
        </div>
    `;
    
    // Display summary differences (from DeepDiff) if available and detailed is empty
    if (detailedDiffs.length === 0 && summary) {
        // Added items
        if (summary.added && summary.added.length > 0) {
            resultsHtml += `
                <div class="mb-1">
                    <h4 class="text-xs font-semibold mb-0.5 ${state.darkMode ? 'text-green-400' : 'text-green-700'}">Added Keys:</h4>
                    <div class="${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-1 font-mono text-xs">
                        ${summary.added.map(path => `<div class="mb-0.5 ${state.darkMode ? 'text-green-300' : 'text-green-600'}">+ ${escapeHtml(path)}</div>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // Removed items
        if (summary.removed && summary.removed.length > 0) {
            resultsHtml += `
                <div class="mb-1">
                    <h4 class="text-xs font-semibold mb-0.5 ${state.darkMode ? 'text-red-400' : 'text-red-700'}">Removed Keys:</h4>
                    <div class="${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-1 font-mono text-xs">
                        ${summary.removed.map(path => `<div class="mb-0.5 ${state.darkMode ? 'text-red-300' : 'text-red-600'}">- ${escapeHtml(path)}</div>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // Changed values
        if (summary.changed && Object.keys(summary.changed).length > 0) {
            resultsHtml += `
                <div class="mb-1">
                    <h4 class="text-xs font-semibold mb-0.5 ${state.darkMode ? 'text-yellow-400' : 'text-yellow-700'}">Changed Values:</h4>
                    <div class="${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-1 font-mono text-xs space-y-0.5">
            `;
            for (const [path, change] of Object.entries(summary.changed)) {
                resultsHtml += `
                    <div class="mb-1 pb-1 border-b ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}">
                        <div class="font-semibold mb-0.5" style="color: ${state.darkMode ? '#f1f5f9' : '#0f172a'};">${escapeHtml(path)}</div>
                        <div class="ml-2">
                            <div class="mb-0.5 ${state.darkMode ? 'text-red-300' : 'text-red-600'}">- Old: ${escapeHtml(String(change.old_value))}</div>
                            <div class="${state.darkMode ? 'text-green-300' : 'text-green-600'}">+ New: ${escapeHtml(String(change.new_value))}</div>
                        </div>
                    </div>
                `;
            }
            resultsHtml += `
                    </div>
                </div>
            `;
        }
        
        // Array added items
        if (summary.array_added && Object.keys(summary.array_added).length > 0) {
            resultsHtml += `
                <div class="mb-1">
                    <h4 class="text-xs font-semibold mb-0.5 ${state.darkMode ? 'text-green-400' : 'text-green-700'}">Array Items Added:</h4>
                    <div class="${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-1 font-mono text-xs">
            `;
            for (const [path, value] of Object.entries(summary.array_added)) {
                resultsHtml += `<div class="mb-0.5 ${state.darkMode ? 'text-green-300' : 'text-green-600'}">+ ${escapeHtml(path)}: ${escapeHtml(JSON.stringify(value))}</div>`;
            }
            resultsHtml += `
                    </div>
                </div>
            `;
        }
        
        // Array removed items
        if (summary.array_removed && Object.keys(summary.array_removed).length > 0) {
            resultsHtml += `
                <div class="mb-1">
                    <h4 class="text-xs font-semibold mb-0.5 ${state.darkMode ? 'text-red-400' : 'text-red-700'}">Array Items Removed:</h4>
                    <div class="${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-1 font-mono text-xs">
            `;
            for (const [path, value] of Object.entries(summary.array_removed)) {
                resultsHtml += `<div class="mb-0.5 ${state.darkMode ? 'text-red-300' : 'text-red-600'}">- ${escapeHtml(path)}: ${escapeHtml(JSON.stringify(value))}</div>`;
            }
            resultsHtml += `
                    </div>
                </div>
            `;
        }
    }
    
    resultsHtml += `
            </div>
        </div>
    `;
    
    return resultsHtml;
}