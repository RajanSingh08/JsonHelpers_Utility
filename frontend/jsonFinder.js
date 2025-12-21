/**
 * JSON Finder Module - Frontend logic for JSON Finder functionality
 * Rebuilt from scratch to match jsonpathfinder.com functionality
 * Uses Vanilla JavaScript + Tailwind CSS
 */

// Note: API_BASE is defined in app.js, don't redeclare it here

// Constants
const MAX_UNDO_HISTORY = 5; // Maximum number of undo steps

// JSON Finder specific state
let jsonFinderState = {
    expandedPaths: new Set(), // Track which paths are expanded
    selectedPath: null,
    selectedValue: null,
    jsonHistory: [], // Track JSON input history for undo: [{value, cursorPos}]
    viewMode: 'treePath', // 'treePath' or 'treeViewer' (right panel)
    showColored: false, // Show syntax-highlighted colored JSON preview
    treeViewerExpanded: new Set() // Track expanded paths in Tree Viewer
};

/**
 * Render the JSON Finder mode UI
 */
function renderFinderMode() {
    const bgClass = state.darkMode ? 'bg-gray-800' : 'bg-white';
    const borderClass = state.darkMode ? 'border-gray-700' : 'border-gray-200';
    const treeBg = state.darkMode ? 'bg-gray-900' : 'bg-gray-50';
    const textClass = state.darkMode ? 'text-gray-100' : 'text-gray-900';
    
    // Parse JSON
    let parsedJson = null;
    let jsonError = null;
    if (state.json1 && state.json1.trim() && state.json1 !== '{}') {
        try {
            parsedJson = JSON.parse(state.json1);
        } catch (e) {
            jsonError = e.message;
        }
    }
    
    return `
        <div class="flex flex-col" style="height: calc(100vh - 60px);">
            <!-- Main Content: 2-Panel Layout -->
            <div class="grid grid-cols-2" style="flex: 1; min-height: 0; gap: 2px;">
                <!-- Left Panel: JSON Input -->
                <div class="${bgClass} flex flex-col" style="overflow: hidden; border-right: 1px solid ${state.darkMode ? '#374151' : '#e5e7eb'};">
                    <!-- Toolbar with buttons -->
                    <div class="flex items-center justify-between px-3 py-2 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                        <h2 class="text-base font-semibold ${textClass} flex items-center gap-1.5">
                            <span>JSON Input</span>
                        </h2>
                        <div class="flex gap-1.5">
                            <button 
                                onclick="handleJsonFinderFormat()" 
                                class="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-xs font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1"
                                title="Format/Beautify JSON with color highlighting"
                            >
                                <span>Beautify</span>
                            </button>
                            <button 
                                onclick="handleJsonFinderMinify()" 
                                class="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded text-xs font-medium hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-1"
                                title="Minify JSON (remove whitespace)"
                            >
                                <span>Minify</span>
                            </button>
                            <button 
                                onclick="handleJsonFinderReset()" 
                                class="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded text-xs font-medium hover:from-gray-600 hover:to-gray-700 transition-all flex items-center gap-1"
                                title="Clear JSON input"
                            >
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Search Bar for Left Panel (Non-functional) -->
                    <div class="px-3 py-1.5 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                        <div class="flex items-center gap-1.5">
                            <input 
                                type="text" 
                                id="json-finder-search-left" 
                                placeholder="Search in JSON..." 
                                disabled
                                class="flex-1 px-2 py-1 text-xs rounded border ${state.darkMode ? 'bg-gray-900 text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500 opacity-50 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    
                    <div class="p-2 flex flex-col" style="flex: 1; min-height: 0;">
                    ${jsonError ? `
                            <div class="mb-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-xs flex items-center gap-1.5" style="flex-shrink: 0;">
                                <span>${jsonError}</span>
                        </div>
                    ` : ''}
                    
                    ${jsonFinderState.showColored && parsedJson ? `
                        <div 
                            id="json-finder-colored-preview" 
                            class="flex-1 overflow-auto ${state.darkMode ? 'bg-gray-900' : 'bg-white'} rounded border ${borderClass}"
                            style="min-height: 0; overflow-y: auto; overflow-x: auto; padding: 12px; position: relative; cursor: pointer;"
                            onclick="jsonFinderState.showColored = false; render(); setTimeout(() => { const textarea = document.getElementById('json-finder-input'); if (textarea) { textarea.focus(); textarea.setSelectionRange(0, 0); } }, 50);"
                            title="Click to edit JSON"
                        >
                            <div style="position: absolute; top: 8px; right: 8px; background: ${state.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)'}; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: ${state.darkMode ? '#9ca3af' : '#6b7280'}; pointer-events: none;">
                                Click to edit
                            </div>
                            ${renderJsonViewer(parsedJson)}
                        </div>
                    ` : `
                        <div style="position: relative; flex: 1; min-height: 0;">
                    <textarea 
                        id="json-finder-input" 
                                class="w-full h-full p-3 rounded border ${state.darkMode ? 'bg-gray-900 text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                style="position: relative; z-index: 2; background: ${state.darkMode ? '#111827' : '#ffffff'}; overflow-x: auto; overflow-y: auto; white-space: pre; word-wrap: normal; overflow-wrap: normal; font-size: 14px; line-height: 1.7; font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;"
                                placeholder="Paste your JSON here or start typing..."
                        oninput="handleJsonFinderInput(this.value)"
                                onkeydown="if((event.ctrlKey || event.metaKey) && event.key === 'z') { event.preventDefault(); undoJsonInput(); }"
                    >${state.json1 && state.json1 !== '{}' ? state.json1 : ''}</textarea>
                        </div>
                    `}
                    </div>
                </div>
                
                <!-- Right Panel: Tree View / Viewer View -->
                <div class="${bgClass} flex flex-col" style="overflow: hidden;">
                    <!-- View Toggle Header -->
                    <div class="flex justify-between items-center px-3 py-2 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                        <h2 class="text-base font-semibold ${textClass} flex items-center gap-1.5">
                            <span>View</span>
                        </h2>
                        <div class="flex gap-1.5">
                            <button 
                                onclick="jsonFinderState.viewMode = 'treePath'; render(); setTimeout(() => updateJsonFinderTree(), 50);"
                                class="px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${jsonFinderState.viewMode === 'treePath' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}"
                                title="Tree Path View"
                            >
                                <span>Tree Path</span>
                            </button>
                            <button 
                                onclick="jsonFinderState.viewMode = 'treeViewer'; render(); setTimeout(() => updateTreeViewer(), 50);"
                                class="px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${jsonFinderState.viewMode === 'treeViewer' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}"
                                title="Tree Viewer"
                            >
                                <span>Tree Viewer</span>
                            </button>
                        </div>
                    </div>
                    
                    ${jsonFinderState.viewMode === 'treePath' ? `
                        <!-- Search Bar for Tree View (Non-functional) -->
                        <div class="px-3 py-1.5 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                            <div class="flex items-center gap-1.5">
                                    <input 
                                        type="text" 
                                    id="json-finder-search-right" 
                                    placeholder="Search in tree..." 
                                    disabled
                                    class="flex-1 px-2 py-1 text-xs rounded border ${state.darkMode ? 'bg-gray-900 text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500 opacity-50 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        
                        <div class="px-2 pt-1 pb-0" style="flex-shrink: 0;">
                            <!-- Path Display - Simple one line -->
                            <div class="py-0.5 px-1.5 rounded border-2 ${state.darkMode ? 'bg-gray-900 border-blue-600' : 'bg-blue-50 border-blue-300'}" style="margin: 0;">
                                <div class="flex items-center gap-1.5">
                                    <label class="text-xs font-bold ${state.darkMode ? 'text-blue-300' : 'text-blue-700'} whitespace-nowrap flex items-center gap-0.5">
                                        <span>Path:</span>
                                    </label>
                                    <span id="json-finder-path-display" class="flex-1 text-xs font-mono ${state.darkMode ? 'text-blue-200' : 'text-blue-800'}">
                                        ${jsonFinderState.selectedPath ? convertPathToX(jsonFinderState.selectedPath) : 'Select an item to view its path'}
                                    </span>
                                    <button 
                                        onclick="copyJsonFinderPath()" 
                                        class="px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-xs font-medium hover:from-blue-600 hover:to-blue-700 whitespace-nowrap transition-all flex items-center gap-0.5"
                                        ${!jsonFinderState.selectedPath ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                                        title="Copy Path"
                                    >
                                        <span>Copy Path</span>
                                    </button>
                                    <button 
                                        onclick="copyJsonFinderValue()" 
                                        class="px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-xs font-medium hover:from-green-600 hover:to-green-700 whitespace-nowrap transition-all flex items-center gap-0.5"
                                        ${!jsonFinderState.selectedValue ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                                        title="Copy Value"
                                    >
                                        <span>Copy Value</span>
                                    </button>
                                </div>
                            </div>
                    </div>
                    
                        <div class="p-2 flex flex-col" style="flex: 1; min-height: 0;">
                    <!-- Tree View Container -->
                    <div 
                        id="json-finder-tree" 
                            class="flex-1 overflow-auto ${treeBg} rounded px-2 py-1 border ${borderClass} font-mono"
                            style="min-height: 0; overflow-y: auto; color: inherit; font-size: 14px; line-height: 1.7; font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;"
                    >
                        ${parsedJson ? '' : `
                            <div class="text-center ${state.darkMode ? 'text-gray-400' : 'text-gray-500'} mt-20">
                                ${jsonError ? 'Invalid JSON - please check your input' : 'Paste JSON on the left to see tree view here'}
                            </div>
                        `}
                    </div>
                        </div>
                    ` : `
                        <!-- Search Bar for Tree Viewer (Non-functional) -->
                        <div class="px-3 py-1.5 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                            <div class="flex items-center gap-1.5">
                                <input 
                                    type="text" 
                                    id="json-finder-search-tree-viewer" 
                                    placeholder="Search in Tree Viewer..." 
                                    disabled
                                    class="flex-1 px-2 py-1 text-xs rounded border ${state.darkMode ? 'bg-gray-900 text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500 opacity-50 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        
                        <!-- Tree Viewer Container -->
                        <div class="p-2 flex flex-col" style="flex: 1; min-height: 0;">
                        <div 
                            id="json-finder-tree-viewer" 
                            class="flex-1 overflow-auto ${state.darkMode ? 'bg-gray-900' : 'bg-white'} rounded border ${borderClass}"
                            style="min-height: 0; overflow-y: auto; padding: 12px;"
                        >
                            ${parsedJson ? renderTreeViewer(parsedJson, 'root', 0) : `
                                <div class="text-center ${state.darkMode ? 'text-gray-400' : 'text-gray-500'} mt-20 p-4">
                                    ${jsonError ? `<div class="text-red-500">Invalid JSON: ${jsonError}</div>` : 'Paste JSON on the left to see viewer here'}
                                </div>
                            `}
                        </div>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

/**
 * Validate JSON and update error state
 */
function validateJsonInput(value) {
    if (value && value.trim() && value !== '{}') {
        try {
            JSON.parse(value);
            state.errors.json1 = null;
        } catch (e) {
            state.errors.json1 = e.message;
        }
    } else {
        state.errors.json1 = null;
    }
}

/**
 * Restore cursor position in textarea after render
 */
function restoreCursorPosition(textarea, cursorPos, value) {
    if (!textarea) return;
    
    textarea.value = value;
    const safeCursorPos = Math.min(cursorPos, value.length);
    textarea.setSelectionRange(safeCursorPos, safeCursorPos);
    textarea.focus();
}

/**
 * Save current state to undo history
 */
function saveToHistory(value, cursorPos) {
    if (value === undefined || value === null) return;
    
    jsonFinderState.jsonHistory.push({ value, cursorPos });
    
    // Keep only last N changes (remove oldest if exceeds limit)
    if (jsonFinderState.jsonHistory.length > MAX_UNDO_HISTORY) {
        jsonFinderState.jsonHistory.shift();
    }
}

/**
 * Apply JSON value and update UI
 */
function applyJsonValue(value, cursorPos = 0) {
    state.json1 = value;
    validateJsonInput(value);
    render();
    
    // Restore cursor position after render
    setTimeout(() => {
        const textarea = document.getElementById('json-finder-input');
        restoreCursorPosition(textarea, cursorPos, value);
    }, 0);
    
    // Update views based on current mode
    setTimeout(async () => {
        // Update colored preview if enabled
        if (jsonFinderState.showColored) {
            updateColoredPreview();
        }
        
        // Update right panel based on view mode
        if (jsonFinderState.viewMode === 'treePath') {
        await updateJsonFinderTree();
        } else if (jsonFinderState.viewMode === 'treeViewer') {
            updateTreeViewer();
        }
    }, 10);
}

/**
 * Handle JSON input changes
 */
async function handleJsonFinderInput(value) {
    const textarea = document.getElementById('json-finder-input');
    const oldValue = state.json1 || '';
    const newValue = value || '';
    
    // Detect if this is likely a paste operation (large increase in length)
    const isPaste = newValue.length > oldValue.length + 50;
    
    // For paste operations, set cursor to top (position 0)
    // For normal typing, preserve cursor position
    const cursorPos = isPaste ? 0 : (textarea ? textarea.selectionStart : 0);
    
    // Save previous state to history before updating
    if (oldValue !== value && oldValue !== undefined && oldValue !== null) {
        saveToHistory(oldValue, textarea ? textarea.selectionStart : 0);
    }
    
    // Apply new value (this will update viewer if needed)
    applyJsonValue(value, cursorPos);
}

/**
 * Undo last change in JSON input (Ctrl+Z / Command+Z)
 * Supports undoing up to MAX_UNDO_HISTORY previous changes
 */
function undoJsonInput() {
    if (jsonFinderState.jsonHistory.length === 0) return;
    
    // Get the most recent change (LIFO - Last In First Out)
    const history = jsonFinderState.jsonHistory.pop();
    
    // Apply the previous state
    applyJsonValue(history.value, history.cursorPos || 0);
}


/**
 * Render JSON in viewer mode with syntax highlighting (jsonviewer.stack.hu style)
 */
function renderJsonViewer(obj) {
    const jsonString = JSON.stringify(obj, null, 2);
    
    // Color scheme matching jsonviewer.stack.hu
    const colors = {
        key: state.darkMode ? '#7dd3fc' : '#0066cc',
        string: state.darkMode ? '#6ee7b7' : '#008000',
        number: state.darkMode ? '#fbbf24' : '#ff6600',
        boolean: state.darkMode ? '#5eead4' : '#0099ff',
        null: state.darkMode ? '#c084fc' : '#990099',
        bracket: state.darkMode ? '#d4d4d8' : '#000000',
        colon: state.darkMode ? '#a1a1aa' : '#666666',
        comma: state.darkMode ? '#a1a1aa' : '#666666'
    };
    
    let html = '';
    let inString = false;
    let currentValue = '';
    let valueType = null;
    
    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];
        const nextChar = jsonString[i + 1];
        
        if (char === '"' && jsonString[i - 1] !== '\\') {
            if (!inString) {
                // Start of string
                inString = true;
                currentValue = '"';
                valueType = null;
            } else {
                // End of string
                currentValue += '"';
                inString = false;
                
                // Determine if it's a key or value
                const afterString = jsonString.substring(i + 1).trim();
                if (afterString.startsWith(':')) {
                    // It's a key
                    html += `<span style="color: ${colors.key}">${escapeHtml(currentValue)}</span>`;
                } else {
                    // It's a string value
                    html += `<span style="color: ${colors.string}">${escapeHtml(currentValue)}</span>`;
                }
                currentValue = '';
            }
        } else if (inString) {
            currentValue += char;
        } else if (char === ':') {
            html += `<span style="color: ${colors.colon}">:</span>`;
        } else if (char === ',') {
            html += `<span style="color: ${colors.comma}">,</span>`;
        } else if (char === '{' || char === '}') {
            html += `<span style="color: ${colors.bracket}; font-weight: 600;">${char}</span>`;
        } else if (char === '[' || char === ']') {
            html += `<span style="color: ${colors.bracket}; font-weight: 600;">${char}</span>`;
        } else if (/\d/.test(char)) {
            // Number
            let numStr = char;
            let j = i + 1;
            while (j < jsonString.length && /[\d.eE+-]/.test(jsonString[j])) {
                numStr += jsonString[j];
                j++;
            }
            html += `<span style="color: ${colors.number}">${numStr}</span>`;
            i = j - 1;
        } else if (char === 't' && jsonString.substring(i, i + 4) === 'true') {
            html += `<span style="color: ${colors.boolean}">true</span>`;
            i += 3;
        } else if (char === 'f' && jsonString.substring(i, i + 5) === 'false') {
            html += `<span style="color: ${colors.boolean}">false</span>`;
            i += 4;
        } else if (char === 'n' && jsonString.substring(i, i + 4) === 'null') {
            html += `<span style="color: ${colors.null}; font-style: italic;">null</span>`;
            i += 3;
        } else if (char === '\n' || char === '\r') {
            html += char;
        } else if (char === ' ') {
            html += ' ';
        } else {
            html += escapeHtml(char);
        }
    }
    
    return `<pre class="p-4 m-0" style="font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace; font-size: 14px; line-height: 1.8; white-space: pre; word-wrap: normal; overflow-wrap: normal;"><code style="color: inherit;">${html}</code></pre>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/**
 * Render JSON in Tree Viewer format (hierarchical with expand/collapse)
 */
function renderTreeViewer(obj, key, level, path = '') {
    const currentPath = path ? `${path}.${key}` : key;
    const isExpanded = jsonFinderState.treeViewerExpanded.has(currentPath);
    const indent = level * 20;
    const isObject = typeof obj === 'object' && obj !== null && !Array.isArray(obj);
    const isArray = Array.isArray(obj);
    const hasChildren = isObject ? Object.keys(obj).length > 0 : (isArray ? obj.length > 0 : false);
    
    let html = '';
    const lineStyle = `padding-left: ${indent}px; padding-top: 4px; padding-bottom: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace; font-size: 14px;`;
    const bracketColor = state.darkMode ? '#3b82f6' : '#2563eb'; // Blue color for brackets
    const keyColor = state.darkMode ? '#e5e7eb' : '#1f2937'; // White/light gray for keys (normal, realistic)
    const colonColor = state.darkMode ? '#a1a1aa' : '#71717a'; // Gray for colon
    const valueColor = state.darkMode ? '#6ee7b7' : '#059669'; // Green for strings
    const numberColor = state.darkMode ? '#fbbf24' : '#d97706'; // Orange for numbers
    const booleanColor = state.darkMode ? '#5eead4' : '#0d9488'; // Cyan for booleans
    const nullColor = state.darkMode ? '#c084fc' : '#9333ea'; // Purple for null
    
    // Faded box style for +/- icons
    const expandIconStyle = `display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background-color: ${state.darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'}; border: 1px solid ${state.darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}; border-radius: 3px; color: ${bracketColor}; font-weight: bold; font-size: 12px; flex-shrink: 0;`;
    
    if (level === 0) {
        // Root level
        html += `<div style="${lineStyle}" onclick="toggleTreeViewer('${currentPath}');">
            <span style="${expandIconStyle}">${isExpanded ? '−' : '+'}</span>
            <span style="color: ${keyColor}; font-weight: 500;">json</span>
            <span style="color: ${bracketColor}; font-weight: 900; font-size: 16px;">{}</span>
        </div>`;
        
        if (isExpanded && hasChildren) {
            if (isObject) {
                Object.keys(obj).forEach(k => {
                    html += renderTreeViewer(obj[k], k, level + 1, currentPath);
                });
            } else if (isArray) {
                obj.forEach((item, index) => {
                    html += renderTreeViewer(item, index, level + 1, currentPath);
                });
            }
        }
    } else {
        // Child levels
        if (isObject || isArray) {
            const bracketType = isArray ? '[]' : '{}';
            html += `<div style="${lineStyle}" onclick="toggleTreeViewer('${currentPath}');">
                <span style="${expandIconStyle}">${isExpanded ? '−' : '+'}</span>
                <span style="color: ${bracketColor}; font-weight: 900; font-size: 16px;">${bracketType}</span>
                <span style="color: ${keyColor}; font-weight: 500;">${escapeHtml(String(key))}</span>
            </div>`;
            
            if (isExpanded && hasChildren) {
                if (isObject) {
                    Object.keys(obj).forEach(k => {
                        html += renderTreeViewer(obj[k], k, level + 1, currentPath);
                    });
                } else if (isArray) {
                    obj.forEach((item, index) => {
                        html += renderTreeViewer(item, index, level + 1, currentPath);
                    });
                }
            }
        } else {
            // Primitive value - show as smaller square box
            let valueDisplay = '';
            let valueStyle = '';
            let squareBoxColor = '';
            
            if (typeof obj === 'string') {
                valueDisplay = `"${escapeHtml(obj)}"`;
                valueStyle = `color: ${valueColor};`;
                // Dark blue for strings
                squareBoxColor = state.darkMode ? '#1e40af' : '#1e3a8a';
            } else if (typeof obj === 'number') {
                valueDisplay = String(obj);
                valueStyle = `color: ${numberColor};`;
                // Yellow for integers/numbers
                squareBoxColor = state.darkMode ? '#fbbf24' : '#eab308';
            } else if (typeof obj === 'boolean') {
                valueDisplay = String(obj);
                valueStyle = `color: ${booleanColor};`;
                // Dark blue for booleans (same as strings)
                squareBoxColor = state.darkMode ? '#1e40af' : '#1e3a8a';
            } else if (obj === null) {
                valueDisplay = 'null';
                valueStyle = `color: ${nullColor}; font-style: italic;`;
                // Red for null
                squareBoxColor = state.darkMode ? '#dc2626' : '#ef4444';
            }
            
            const escapedPath = escapeHtml(currentPath);
            const valueJson = escapeHtml(JSON.stringify(obj));
            html += `<div style="${lineStyle}" onclick="selectTreeViewerValueFromElement(this);" data-path="${escapedPath}" data-value="${valueJson}">
                <span style="display: inline-block; width: 8px; height: 8px; background-color: ${squareBoxColor}; border: 1px solid ${squareBoxColor}; margin-right: 4px; flex-shrink: 0; border-radius: 2px;"></span>
                <span style="color: ${keyColor}; font-weight: 500;">${escapeHtml(String(key))}</span>
                <span style="color: ${colonColor};">:</span>
                <span style="${valueStyle}">${valueDisplay}</span>
                <span style="margin-left: 8px; font-size: 11px; color: #10b981; display: none;" class="copy-icon-tree-viewer" title="Copied!">[Copied!]</span>
            </div>`;
        }
    }
    
    return html;
}

/**
 * Toggle expand/collapse in Tree Viewer
 */
function toggleTreeViewer(path) {
    if (jsonFinderState.treeViewerExpanded.has(path)) {
        jsonFinderState.treeViewerExpanded.delete(path);
    } else {
        jsonFinderState.treeViewerExpanded.add(path);
    }
    updateTreeViewer();
}

/**
 * Select and copy value in Tree Viewer (called from onclick)
 */
async function selectTreeViewerValueFromElement(element) {
    const path = element.getAttribute('data-path');
    const valueJson = element.getAttribute('data-value');
    
    if (!path || !valueJson) return;
    
    try {
        const value = JSON.parse(valueJson);
        await selectTreeViewerValue(path, value, element);
    } catch (error) {
        console.error('Failed to parse value:', error);
        // Fallback: try to copy as string
        await selectTreeViewerValue(path, valueJson, element);
    }
}

/**
 * Select and copy value in Tree Viewer
 */
async function selectTreeViewerValue(path, value, clickedElement) {
    jsonFinderState.selectedPath = path;
    jsonFinderState.selectedValue = value;
    
    // Copy value to clipboard
    try {
        const valueToCopy = typeof value === 'object' 
            ? JSON.stringify(value, null, 2)
            : String(value);
        await navigator.clipboard.writeText(valueToCopy);
        
        // Show feedback on the clicked element
        if (clickedElement) {
            const copyIcon = clickedElement.querySelector('.copy-icon-tree-viewer');
            if (copyIcon) {
                // Show the feedback
                copyIcon.style.display = 'inline';
                copyIcon.style.color = '#10b981';
                // Hide after 1 second
                setTimeout(() => {
                    copyIcon.style.display = 'none';
                }, 1000);
            }
        }
    } catch (error) {
        console.error('Failed to copy value:', error);
        alert('Failed to copy value to clipboard');
    }
}

/**
 * Update the Tree Viewer view
 */
function updateTreeViewer() {
    const container = document.getElementById('json-finder-tree-viewer');
    if (!container) return;
    
    const jsonText = (state.json1 && state.json1.trim()) ? state.json1.trim() : '';
    
    if (!jsonText) {
        container.innerHTML = `
            <div class="text-center ${state.darkMode ? 'text-gray-400' : 'text-gray-500'} mt-20 p-4">
                Paste JSON on the left to see viewer here
            </div>
        `;
        return;
    }
    
    try {
        const parsedJson = JSON.parse(jsonText);
        // Ensure root node is expanded by default
        jsonFinderState.treeViewerExpanded.add('root');
        container.innerHTML = renderTreeViewer(parsedJson, 'root', 0);
    } catch (e) {
        container.innerHTML = `
            <div class="text-center ${state.darkMode ? 'text-red-400' : 'text-red-600'} mt-20 p-4">
                Invalid JSON: ${e.message}
            </div>
        `;
    }
}

/**
 * Update the colored preview
 */
function updateColoredPreview() {
    const previewContainer = document.getElementById('json-finder-colored-preview');
    if (!previewContainer) return;
    
    const jsonText = (state.json1 && state.json1.trim()) ? state.json1.trim() : '';
    
    if (!jsonText) {
        previewContainer.innerHTML = `
            <div class="text-center ${state.darkMode ? 'text-gray-400' : 'text-gray-500'} mt-20 p-4">
                Paste JSON to see colored preview here
            </div>
        `;
        return;
    }
    
    try {
        const parsedJson = JSON.parse(jsonText);
        previewContainer.innerHTML = renderJsonViewer(parsedJson);
    } catch (e) {
        previewContainer.innerHTML = `
            <div class="text-center ${state.darkMode ? 'text-red-400' : 'text-red-600'} mt-20 p-4">
                Invalid JSON: ${e.message}
            </div>
        `;
    }
}

/**
 * Update the tree view
 */
async function updateJsonFinderTree() {
    const treeContainer = document.getElementById('json-finder-tree');
    if (!treeContainer) {
        // Retry after a short delay if container doesn't exist yet
        setTimeout(() => updateJsonFinderTree(), 100);
        return;
    }
    
    // Parse JSON
    let parsedJson = null;
    const jsonText = (state.json1 && state.json1.trim()) ? state.json1.trim() : '';
    
    // Check if JSON is empty or just empty object
    if (!jsonText) {
            treeContainer.innerHTML = `
            <div class="text-center ${state.darkMode ? 'text-gray-400' : 'text-gray-500'} mt-20">
                Paste JSON on the left to see tree view here
                </div>
            `;
            return;
        }
    
    // Try to parse JSON
    try {
        parsedJson = JSON.parse(jsonText);
    } catch (e) {
        treeContainer.innerHTML = `
            <div class="text-center ${state.darkMode ? 'text-red-400' : 'text-red-600'} mt-20">
                Invalid JSON: ${e.message}
            </div>
        `;
        return;
    }
    
    // Render tree - start with root, expand by default
    // Use 'x' internally but convert to '$' for API calls
    const rootPath = 'x';
    if (!jsonFinderState.expandedPaths.has(rootPath)) {
        jsonFinderState.expandedPaths.add(rootPath);
    }
    
    // Clear and render tree
    treeContainer.innerHTML = '';
    try {
        renderJsonTree(parsedJson, treeContainer, rootPath, 0, null);
    } catch (e) {
        console.error('Error rendering tree:', e);
        treeContainer.innerHTML = `
            <div class="text-center ${state.darkMode ? 'text-red-400' : 'text-red-600'} mt-20">
                Error rendering tree: ${e.message}
            </div>
        `;
    }
}

/**
 * Render JSON tree recursively
 */
function renderJsonTree(obj, container, path, level, key = null) {
    const isExpanded = jsonFinderState.expandedPaths.has(path);
    const isSelected = jsonFinderState.selectedPath === path;
    
    // Create node container - clean tree view without path display
    const nodeDiv = document.createElement('div');
    nodeDiv.className = `json-tree-node`;
    // Set explicit styles to prevent color inheritance
    nodeDiv.setAttribute('style', `
        padding-left: ${level * 20}px;
        padding-top: 5px;
        padding-bottom: 5px;
        cursor: pointer;
        border-bottom: 1px solid ${state.darkMode ? 'rgba(75, 85, 99, 0.15)' : 'rgba(229, 231, 235, 0.4)'};
        transition: background-color 0.15s ease;
        color: inherit;
        font-size: 14px;
        line-height: 1.7;
        font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
    `);
    
    // Set data-path attribute for navigation
    nodeDiv.setAttribute('data-path', path);
    
    // Selection highlighting
    if (isSelected) {
        nodeDiv.style.backgroundColor = state.darkMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.1)';
        nodeDiv.style.borderLeft = `3px solid ${state.darkMode ? '#3b82f6' : '#2563eb'}`;
        nodeDiv.style.paddingLeft = `${level * 20 - 3}px`;
    }
    
    nodeDiv.onmouseenter = () => {
        if (!isSelected) {
            nodeDiv.style.backgroundColor = state.darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
        }
    };
    nodeDiv.onmouseleave = () => {
        if (!isSelected) {
            nodeDiv.style.backgroundColor = '';
        } else {
            nodeDiv.style.backgroundColor = state.darkMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.1)';
        }
    };
    
    // Handle primitive values
    if (obj === null || obj === undefined) {
        if (key !== null) {
            const keySpan = document.createElement('span');
            // Key color - blue
            keySpan.setAttribute('style', `color: ${state.darkMode ? '#7dd3fc' : '#0284c7'} !important; font-weight: 600;`);
            keySpan.textContent = typeof key === 'number' ? `[${key}]` : `"${key}"`;
            nodeDiv.appendChild(keySpan);
            
            const colonSpan = document.createElement('span');
            colonSpan.textContent = ': ';
            colonSpan.setAttribute('style', `color: ${state.darkMode ? '#a1a1aa' : '#71717a'} !important;`);
            nodeDiv.appendChild(colonSpan);
        }
        
        const valueSpan = document.createElement('span');
        // Null color - purple/magenta
        valueSpan.setAttribute('style', `color: ${state.darkMode ? '#c084fc' : '#9333ea'} !important; font-style: italic;`);
        valueSpan.textContent = 'null';
        nodeDiv.appendChild(valueSpan);
        container.appendChild(nodeDiv);
        return;
    }
    
    if (typeof obj !== 'object') {
        if (key !== null) {
            const keySpan = document.createElement('span');
            // Key color - blue
            keySpan.setAttribute('style', `color: ${state.darkMode ? '#7dd3fc' : '#0284c7'} !important; font-weight: 600;`);
            keySpan.textContent = typeof key === 'number' ? `[${key}]` : `"${key}"`;
            nodeDiv.appendChild(keySpan);
            
            const colonSpan = document.createElement('span');
            colonSpan.textContent = ': ';
            colonSpan.setAttribute('style', `color: ${state.darkMode ? '#a1a1aa' : '#71717a'} !important;`);
            nodeDiv.appendChild(colonSpan);
        }
        
        // Improved value colors - more distinct and vibrant
        let valueColor, valueText;
        if (typeof obj === 'string') {
            // Strings - green/emerald
            valueColor = state.darkMode ? '#6ee7b7' : '#059669';
            valueText = `"${obj}"`;
        } else if (typeof obj === 'number') {
            // Numbers - orange/amber
            valueColor = state.darkMode ? '#fbbf24' : '#d97706';
            valueText = String(obj);
        } else if (typeof obj === 'boolean') {
            // Booleans - cyan/teal
            valueColor = state.darkMode ? '#5eead4' : '#0d9488';
            valueText = String(obj);
        } else {
            // Fallback - purple
            valueColor = state.darkMode ? '#c084fc' : '#9333ea';
            valueText = JSON.stringify(obj);
        }
        
        const valueSpan = document.createElement('span');
        valueSpan.setAttribute('style', `color: ${valueColor} !important;`);
        valueSpan.textContent = valueText;
        nodeDiv.appendChild(valueSpan);
        
        // Handle click - select path and value for leaf nodes
        nodeDiv.onclick = async (e) => {
            e.stopPropagation();
            jsonFinderState.selectedPath = path;
            
            // Get value at path (convert x to $ for API)
            const apiPath = convertPathFromX(path);
            try {
                const response = await fetch(`${API_BASE}/api/value`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        json: state.json1,
                        path: apiPath
                    })
                });
                const data = await response.json();
                jsonFinderState.selectedValue = data.value;
            } catch (error) {
                console.error('Error getting value:', error);
                jsonFinderState.selectedValue = null;
            }
            
            render();
        };
        
        container.appendChild(nodeDiv);
        return;
    }
    
    // Handle objects and arrays
    const isArray = Array.isArray(obj);
    const keys = isArray ? obj.map((_, i) => i) : Object.keys(obj);
    const hasChildren = keys.length > 0;
    
    // Expand/collapse icon for objects/arrays - Larger and more visible
    if (hasChildren) {
        const icon = document.createElement('span');
        icon.textContent = isExpanded ? '▼' : '▶';
        icon.style.cursor = 'pointer';
        icon.style.marginRight = '8px';
        icon.style.fontSize = '16px';
        icon.style.fontWeight = 'bold';
        icon.style.color = state.darkMode ? '#9ca3af' : '#6b7280';
        icon.style.userSelect = 'none';
        icon.style.display = 'inline-block';
        icon.style.minWidth = '20px';
        icon.style.textAlign = 'center';
        icon.onclick = (e) => {
            e.stopPropagation();
            if (jsonFinderState.expandedPaths.has(path)) {
                jsonFinderState.expandedPaths.delete(path);
            } else {
                jsonFinderState.expandedPaths.add(path);
            }
            updateJsonFinderTree();
        };
        nodeDiv.appendChild(icon);
    }
    
    // Key display (if not root)
    if (key !== null) {
        const keySpan = document.createElement('span');
        // Key color - blue
        keySpan.setAttribute('style', `color: ${state.darkMode ? '#7dd3fc' : '#0284c7'} !important; font-weight: 600;`);
        keySpan.textContent = typeof key === 'number' ? `[${key}]` : `"${key}"`;
        nodeDiv.appendChild(keySpan);
        
        const colonSpan = document.createElement('span');
        colonSpan.textContent = ': ';
        colonSpan.setAttribute('style', `color: ${state.darkMode ? '#a1a1aa' : '#71717a'} !important;`);
        nodeDiv.appendChild(colonSpan);
    }
    
    // Value preview for objects/arrays - use a different color
    const valueSpan = document.createElement('span');
    valueSpan.setAttribute('style', `color: ${state.darkMode ? '#d4d4d8' : '#52525b'} !important; font-style: italic;`);
    valueSpan.textContent = isArray ? `Array(${obj.length})` : `Object(${Object.keys(obj).length})`;
    nodeDiv.appendChild(valueSpan);
    
    // Handle click on entire line - expand/collapse if has children, otherwise select path and value
    nodeDiv.onclick = async (e) => {
        e.stopPropagation();
        
        // If it has children, toggle expand/collapse
        if (hasChildren) {
            if (jsonFinderState.expandedPaths.has(path)) {
                jsonFinderState.expandedPaths.delete(path);
            } else {
                jsonFinderState.expandedPaths.add(path);
            }
            updateJsonFinderTree();
        } else {
            // For leaf nodes, select path and value
            jsonFinderState.selectedPath = path;
            
            // Get value at path (convert x to $ for API)
            const apiPath = convertPathFromX(path);
            try {
                const response = await fetch(`${API_BASE}/api/value`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        json: state.json1,
                        path: apiPath
                    })
                });
                const data = await response.json();
                jsonFinderState.selectedValue = data.value;
            } catch (error) {
                console.error('Error getting value:', error);
                jsonFinderState.selectedValue = null;
            }
            
            render();
        }
    };
    
    container.appendChild(nodeDiv);
    
    // Render children if expanded
    if (isExpanded && hasChildren) {
        if (isArray) {
            obj.forEach((item, index) => {
                const childPath = `${path}[${index}]`;
                renderJsonTree(item, container, childPath, level + 1, index);
            });
        } else {
            Object.keys(obj).forEach(key => {
                const childPath = path === 'x' ? `x.${key}` : `${path}.${key}`;
                renderJsonTree(obj[key], container, childPath, level + 1, key);
            });
        }
    }
}


/**
 * Convert path from $ notation to x notation (jsonpathfinder.com style)
 */
function convertPathToX(path) {
    if (!path) return '';
    // Replace $ with x for display
    return path.replace(/^\$/, 'x');
}

/**
 * Convert path from x notation back to $ notation for API calls
 */
function convertPathFromX(path) {
    if (!path) return '$';
    // Replace x with $ for API calls
    return path.replace(/^x/, '$');
}

/**
 * Copy path to clipboard
 */
async function copyJsonFinderPath() {
    if (!jsonFinderState.selectedPath) return;
    
    try {
        // Copy the x. version (user-friendly)
        const pathToCopy = convertPathToX(jsonFinderState.selectedPath);
        await navigator.clipboard.writeText(pathToCopy);
        // Show feedback
        const pathDisplay = document.getElementById('json-finder-path-display');
        if (pathDisplay) {
            const original = pathDisplay.textContent;
            pathDisplay.textContent = 'Copied!';
            setTimeout(() => {
                pathDisplay.textContent = original;
            }, 1000);
        }
    } catch (error) {
        console.error('Failed to copy path:', error);
        alert('Failed to copy path to clipboard');
    }
}

/**
 * Copy value to clipboard
 */
async function copyJsonFinderValue() {
    if (!jsonFinderState.selectedValue) return;
    
    try {
        // Copy the value as JSON string
        const valueToCopy = typeof jsonFinderState.selectedValue === 'object' 
            ? JSON.stringify(jsonFinderState.selectedValue, null, 2)
            : String(jsonFinderState.selectedValue);
        await navigator.clipboard.writeText(valueToCopy);
        // Show feedback
        const pathDisplay = document.getElementById('json-finder-path-display');
        if (pathDisplay) {
            const original = pathDisplay.textContent;
            pathDisplay.textContent = 'Value Copied!';
            setTimeout(() => {
                pathDisplay.textContent = original;
            }, 1000);
        }
    } catch (error) {
        console.error('Failed to copy value:', error);
        alert('Failed to copy value to clipboard');
    }
}


/**
 * Format JSON (Beautify)
 */
async function handleJsonFinderFormat() {
    if (!state.json1 || !state.json1.trim() || state.json1 === '{}') {
        alert('Please enter some JSON first');
        return;
    }
    
    try {
        // Try API first
    try {
        const response = await fetch(`${API_BASE}/api/format`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: state.json1 })
        });
        
            if (response.ok) {
        const data = await response.json();
        if (data.formatted) {
            state.json1 = data.formatted;
                    // Update textarea directly and trigger input handler
                    const textarea = document.getElementById('json-finder-input');
                    if (textarea) {
                        textarea.value = data.formatted;
                        // Trigger input event to update tree
                        handleJsonFinderInput(data.formatted);
                    }
                    // Enable colored preview and update it
                    jsonFinderState.showColored = true;
            render();
                    setTimeout(() => updateColoredPreview(), 50);
                    return;
                }
            }
        } catch (apiError) {
            console.warn('API format failed, using client-side fallback:', apiError);
        }
        
        // Client-side fallback
        try {
            const parsed = JSON.parse(state.json1);
            const formatted = JSON.stringify(parsed, null, 2);
            state.json1 = formatted;
            
            // Update textarea directly and trigger input handler
            const textarea = document.getElementById('json-finder-input');
            if (textarea) {
                textarea.value = formatted;
                // Trigger input event to update tree
                handleJsonFinderInput(formatted);
            }
            // Enable colored preview and update it
            jsonFinderState.showColored = true;
            render();
            setTimeout(() => updateColoredPreview(), 50);
        } catch (parseError) {
            alert('Invalid JSON: ' + parseError.message);
        }
    } catch (error) {
        console.error('Format error:', error);
        alert('Failed to format JSON: ' + error.message);
    }
}

/**
 * Minify JSON
 */
async function handleJsonFinderMinify() {
    if (!state.json1 || !state.json1.trim() || state.json1 === '{}') return;
    
    try {
        const parsed = JSON.parse(state.json1);
        const minified = JSON.stringify(parsed);
        
        // Turn off colored preview when minifying
        jsonFinderState.showColored = false;
        
        // Update JSON state
        state.json1 = minified;
        
        // Update textarea if it exists
        const textarea = document.getElementById('json-finder-input');
        if (textarea) {
            textarea.value = minified;
            // Trigger input handler to update tree and other views
            handleJsonFinderInput(minified);
            
            // Set cursor to leftmost position (position 0)
            setTimeout(() => {
                const updatedTextarea = document.getElementById('json-finder-input');
                if (updatedTextarea) {
                    updatedTextarea.setSelectionRange(0, 0);
                    updatedTextarea.focus();
                }
            }, 50);
        } else {
            // If textarea doesn't exist yet, just render and update tree
            render();
            await updateJsonFinderTree();
            
            // Set cursor to leftmost position after render
            setTimeout(() => {
                const updatedTextarea = document.getElementById('json-finder-input');
                if (updatedTextarea) {
                    updatedTextarea.setSelectionRange(0, 0);
                    updatedTextarea.focus();
                }
            }, 50);
        }
    } catch (error) {
        console.error('Minify error:', error);
        alert('Failed to minify JSON: ' + error.message);
    }
}

/**
 * Reset JSON input
 */
function handleJsonFinderReset() {
    state.json1 = '{}';
    state.errors.json1 = null;
    jsonFinderState.selectedPath = null;
    jsonFinderState.selectedValue = null;
    jsonFinderState.expandedPaths.clear();
    jsonFinderState.showColored = false;
    jsonFinderState.jsonHistory = [];
    render();
    // Reset cursor to top after reset
    setTimeout(() => {
        const textarea = document.getElementById('json-finder-input');
        if (textarea) {
            textarea.setSelectionRange(0, 0);
            textarea.focus();
        }
    }, 10);
}
