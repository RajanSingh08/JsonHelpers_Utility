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
                      <div class="flex items-center px-3 py-1 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                        <div class="flex items-center gap-1.5 flex-1">
                            <button 
                                onclick="switchToJsonMode()"
                                class="px-3 py-1 bg-gradient-to-r ${jsonFinderState.showColored ? 'from-gray-500 to-gray-600' : 'from-blue-500 to-blue-600'} text-white rounded text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-1"
                                title="Switch to JSON edit mode"
                            >
                                <span>JSON</span>
                            </button>
                            <button 
                                onclick="handleJsonFinderFormat()" 
                                class="px-3 py-1 bg-gradient-to-r ${jsonFinderState.showColored ? 'from-green-500 to-green-600' : 'from-gray-500 to-gray-600'} text-white rounded text-xs font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1"
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
                        <div class="flex items-center justify-center flex-1">
                            <h2 class="text-base font-semibold ${textClass} flex items-center gap-1.5">
                                <span>JSON Input</span>
                            </h2>
                        </div>
                        <div class="flex gap-1.5 flex-1 justify-end">
                            <button 
                                onclick="downloadJsonInput()" 
                                class="px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded text-xs font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center"
                                title="Download JSON file"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </button>
                            <label 
                                class="px-3 py-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded text-xs font-medium hover:from-teal-600 hover:to-teal-700 transition-all flex items-center justify-center cursor-pointer"
                                title="Upload JSON file"
                            >
                                <input type="file" accept=".json,application/json" onchange="uploadJsonInput(event)" style="display: none;" />
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                            </label>
                            <button 
                                onclick="copyJsonInput()" 
                                class="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center"
                                title="Copy JSON to clipboard"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </button>
                            <button 
                                onclick="shareJsonInput()" 
                                class="px-3 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded text-xs font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center justify-center"
                                title="Create shareable link"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Search Bar for Left Panel (Non-functional) -->
                    <!--<div class="px-2 py-1.5 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                        <div class="flex items-center gap-1.5">
                            <input 
                                type="text" 
                                id="json-finder-search-left" 
                                placeholder="Search in JSON..." 
                                disabled
                                class="flex-1 px-2 py-1.5 text-xs rounded border ${state.darkMode ? 'bg-gray-900 text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500 opacity-50 cursor-not-allowed"
                            />
                        </div>
                    </div> -->
                    
                    <div class="px-2 pt-0 pb-2 flex flex-col" style="flex: 1; min-height: 0;">
                    ${jsonError ? `
                            <div class="mb-1 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-xs flex items-center gap-1.5" style="flex-shrink: 0;">
                                <span>${jsonError}</span>
                        </div>
                    ` : ''}
                    
                    ${jsonFinderState.showColored && parsedJson ? `
                        <div 
                            id="json-finder-colored-preview" 
                            class="flex-1 overflow-auto ${state.darkMode ? 'bg-gray-900' : 'bg-white'} rounded border ${borderClass}"
                            style="min-height: 0; overflow-y: auto; overflow-x: auto; padding: 12px; position: relative;"
                        >
                            <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 1.5px; z-index: 10;">
                                <button 
                                    onclick="copyJsonInput()" 
                                    class="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center shadow-lg"
                                    style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);"
                                    title="Copy JSON to clipboard"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </button>
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
                    <div class="flex items-center px-3 py-1 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                        <div class="flex items-center gap-1.5 flex-1">
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
                        <div class="flex items-center justify-center flex-1">
                            <h2 class="text-base font-semibold ${textClass} flex items-center gap-1.5">
                                <span>JSON Viewer</span>
                            </h2>
                            </div>
                        <div class="flex-1"></div>
                    </div>
                    
                    ${jsonFinderState.viewMode === 'treePath' ? `
                        
                        <div class="px-2 pt-0 pb-0" style="flex-shrink: 0;">
                            <!-- Path Display - Simple one line -->
                            <div class="py-2 px-1.5 rounded border-2 ${state.darkMode ? 'bg-gray-900 border-indigo-500' : 'bg-indigo-50 border-indigo-400'}" style="margin: 0;">
                                <div class="flex items-center gap-1.5">
                                    <label class="text-xs font-bold ${state.darkMode ? 'text-indigo-300' : 'text-indigo-700'} whitespace-nowrap flex items-center gap-0.5">
                                        <span>Path:</span>
                                    </label>
                                    <span id="json-finder-path-display" class="flex-1 font-mono ${state.darkMode ? 'text-indigo-200' : 'text-indigo-800'}" style="font-size: 14px;">
                                        ${jsonFinderState.selectedPath ? convertPathToX(jsonFinderState.selectedPath) : 'Select an item to view its path'}
                                    </span>
                                    <button 
                                        onclick="copyJsonFinderPath()" 
                                        class="px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-xs font-medium hover:from-blue-600 hover:to-blue-700 whitespace-nowrap transition-all flex items-center gap-0.5"
                                        ${!parsedJson || jsonError ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                                        title="Copy Path"
                                    >
                                        <span>Copy Path</span>
                                    </button>
                                </div>
                            </div>
                    </div>
                    
                        <div class="px-2 pt-0 pb-2 flex flex-col" style="flex: 1; min-height: 0;">
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
                        
                        <!-- Tree Viewer Container -->
                        <div class="px-2 pt-0 pb-2 flex flex-col" style="flex: 1; min-height: 0;">
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
    
    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];
        
        if (char === '"' && jsonString[i - 1] !== '\\') {
            if (!inString) {
                // Start of string
                inString = true;
                currentValue = '"';
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
            const escapedKey = escapeHtml(String(key));
            const safeKey = escapedKey.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            html += `<div style="${lineStyle}" onclick="toggleTreeViewer('${currentPath}');">
                <span style="${expandIconStyle}">${isExpanded ? '−' : '+'}</span>
                <span style="color: ${bracketColor}; font-weight: 900; font-size: 16px;">${bracketType}</span>
                <span style="color: ${keyColor}; font-weight: 500; cursor: pointer;" onclick="event.stopPropagation(); copyTreeViewerKey('${safeKey}', this);">${escapedKey}</span>
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
            const escapedKey = escapeHtml(String(key));
            html += `<div style="${lineStyle}" onclick="selectTreeViewerValueFromElement(this);" data-path="${escapedPath}" data-value="${valueJson}">
                <span style="display: inline-block; width: 8px; height: 8px; background-color: ${squareBoxColor}; border: 1px solid ${squareBoxColor}; margin-right: 4px; flex-shrink: 0; border-radius: 2px;"></span>
                <span class="tree-viewer-key" style="color: ${keyColor}; font-weight: 500; cursor: pointer;" onclick="event.stopPropagation(); copyTreeViewerKey('${escapedKey.replace(/'/g, "\\'")}', this);">${escapedKey}</span>
                <span style="color: ${colonColor};">:</span>
                <span class="tree-viewer-value" style="${valueStyle}">${valueDisplay}</span>
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
 * Copy key in Tree Viewer (called from onclick)
 */
async function copyTreeViewerKey(key, element) {
    try {
        await navigator.clipboard.writeText(key);
        // Show feedback inline like Tree Path - replace key text with "Copied!"
        const keySpan = element || window.event?.target;
        if (keySpan && keySpan.classList.contains('tree-viewer-key')) {
            const originalText = keySpan.textContent;
            const originalColor = keySpan.style.color;
            keySpan.textContent = 'Copied!';
            keySpan.style.color = state.darkMode ? '#10b981' : '#059669';
            setTimeout(() => {
                keySpan.textContent = originalText;
                keySpan.style.color = originalColor;
            }, 1000);
        }
    } catch (error) {
        console.error('Failed to copy key:', error);
    }
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
        
        // Show feedback inline like Tree Path - replace value text with "Copied!"
        if (clickedElement) {
            const valueSpan = clickedElement.querySelector('.tree-viewer-value');
            if (valueSpan) {
                const originalText = valueSpan.textContent;
                const originalColor = valueSpan.style.color;
                valueSpan.textContent = 'Copied!';
                valueSpan.style.color = state.darkMode ? '#10b981' : '#059669';
                setTimeout(() => {
                    valueSpan.textContent = originalText;
                    valueSpan.style.color = originalColor;
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
    
    // Preserve scroll position
    const scrollTop = treeContainer.scrollTop;
    const selectedPath = jsonFinderState.selectedPath;
    
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
        
            // Restore scroll position
            setTimeout(() => {
                treeContainer.scrollTop = scrollTop;
                
                // Scroll to selected path if exists
                if (selectedPath) {
                    const selectedNode = treeContainer.querySelector(`[data-path="${selectedPath}"]`);
                    if (selectedNode) {
                        selectedNode.scrollIntoView({ behavior: 'auto', block: 'center' });
                    }
                }
            }, 10);
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
            keySpan.setAttribute('style', `color: ${state.darkMode ? '#7dd3fc' : '#0284c7'} !important; font-weight: 600; cursor: pointer;`);
            keySpan.textContent = typeof key === 'number' ? `[${key}]` : `"${key}"`;
            keySpan.className = 'json-key-clickable';
            nodeDiv.appendChild(keySpan);
            
            // Click to copy key
            keySpan.onclick = async (e) => {
                e.stopPropagation();
                try {
                    const keyToCopy = typeof key === 'number' ? String(key) : key;
                    await navigator.clipboard.writeText(keyToCopy);
                    const originalColor = keySpan.style.color;
                    keySpan.style.color = state.darkMode ? '#10b981' : '#059669';
                    const originalText = keySpan.textContent;
                    keySpan.textContent = '✓ Copied!';
                    setTimeout(() => {
                        keySpan.textContent = originalText;
                        keySpan.style.color = originalColor;
                    }, 1000);
                } catch (error) {
                    console.error('Failed to copy key:', error);
                }
            };
            
            const colonSpan = document.createElement('span');
            colonSpan.textContent = ': ';
            colonSpan.setAttribute('style', `color: ${state.darkMode ? '#a1a1aa' : '#71717a'} !important;`);
            nodeDiv.appendChild(colonSpan);
        }
        
        const valueSpan = document.createElement('span');
        // Null color - purple/magenta
        valueSpan.setAttribute('style', `color: ${state.darkMode ? '#c084fc' : '#9333ea'} !important; font-style: italic; cursor: pointer;`);
        valueSpan.textContent = 'null';
        valueSpan.className = 'json-value-clickable';
        valueSpan.setAttribute('data-path', path);
        valueSpan.setAttribute('data-value', 'null');
        
        // Click to copy value
        valueSpan.onclick = async (e) => {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText('null');
                const originalColor = valueSpan.style.color;
                valueSpan.style.color = state.darkMode ? '#10b981' : '#059669';
                valueSpan.textContent = '✓ Copied!';
                setTimeout(() => {
                    valueSpan.textContent = 'null';
                    valueSpan.style.color = originalColor;
                }, 1000);
            } catch (error) {
                console.error('Failed to copy:', error);
            }
        };
        
        nodeDiv.appendChild(valueSpan);
        
        // Handle click on line (not value or key)
        nodeDiv.onclick = async (e) => {
            if (e.target === valueSpan || e.target.closest('.json-value-clickable') || e.target.closest('.json-key-clickable')) {
                return;
            }
            e.stopPropagation();
            jsonFinderState.selectedPath = path;
            jsonFinderState.selectedValue = null;
            const pathDisplay = document.getElementById('json-finder-path-display');
            if (pathDisplay) {
                pathDisplay.textContent = convertPathToX(path);
            }
        };
        
        container.appendChild(nodeDiv);
        return;
    }
    
    if (typeof obj !== 'object') {
        if (key !== null) {
            const keySpan = document.createElement('span');
            // Key color - blue
            keySpan.setAttribute('style', `color: ${state.darkMode ? '#7dd3fc' : '#0284c7'} !important; font-weight: 600; cursor: pointer;`);
            keySpan.textContent = typeof key === 'number' ? `[${key}]` : `"${key}"`;
            keySpan.className = 'json-key-clickable';
            nodeDiv.appendChild(keySpan);
            
            // Click to copy key
            keySpan.onclick = async (e) => {
                e.stopPropagation();
                try {
                    const keyToCopy = typeof key === 'number' ? String(key) : key;
                    await navigator.clipboard.writeText(keyToCopy);
                    const originalColor = keySpan.style.color;
                    keySpan.style.color = state.darkMode ? '#10b981' : '#059669';
                    const originalText = keySpan.textContent;
                    keySpan.textContent = '✓ Copied!';
                    setTimeout(() => {
                        keySpan.textContent = originalText;
                        keySpan.style.color = originalColor;
                    }, 1000);
                } catch (error) {
                    console.error('Failed to copy key:', error);
                }
            };
            
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
        valueSpan.setAttribute('style', `color: ${valueColor} !important; cursor: pointer;`);
        valueSpan.textContent = valueText;
        valueSpan.className = 'json-value-clickable';
        valueSpan.setAttribute('data-path', path);
        valueSpan.setAttribute('data-value', JSON.stringify(obj));
        
        // Click to copy value directly
        valueSpan.onclick = async (e) => {
            e.stopPropagation();
            try {
                const valueToCopy = typeof obj === 'object' ? JSON.stringify(obj, null, 2) : String(obj);
                await navigator.clipboard.writeText(valueToCopy);
                // Show feedback
                const originalColor = valueSpan.style.color;
                valueSpan.style.color = state.darkMode ? '#10b981' : '#059669';
                valueSpan.textContent = '✓ Copied!';
                setTimeout(() => {
                    valueSpan.textContent = valueText;
                    valueSpan.style.color = originalColor;
                }, 1000);
            } catch (error) {
                console.error('Failed to copy:', error);
            }
        };
        
        nodeDiv.appendChild(valueSpan);
        
        // Handle click on line (not value or key) - select path and value for leaf nodes
        nodeDiv.onclick = async (e) => {
            // Don't handle if clicked on value span or key span
            if (e.target === valueSpan || e.target.closest('.json-value-clickable') || e.target.closest('.json-key-clickable')) {
                return;
            }
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
            
            // Update only path display, don't re-render tree
            const pathDisplay = document.getElementById('json-finder-path-display');
            if (pathDisplay) {
                pathDisplay.textContent = convertPathToX(path);
            }
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
        keySpan.setAttribute('style', `color: ${state.darkMode ? '#7dd3fc' : '#0284c7'} !important; font-weight: 600; cursor: pointer;`);
        keySpan.textContent = typeof key === 'number' ? `[${key}]` : `"${key}"`;
        keySpan.className = 'json-key-clickable';
        nodeDiv.appendChild(keySpan);
        
        // Click to copy key
        keySpan.onclick = async (e) => {
            e.stopPropagation();
            try {
                const keyToCopy = typeof key === 'number' ? String(key) : key;
                await navigator.clipboard.writeText(keyToCopy);
                const originalColor = keySpan.style.color;
                keySpan.style.color = state.darkMode ? '#10b981' : '#059669';
                const originalText = keySpan.textContent;
                keySpan.textContent = '✓ Copied!';
                setTimeout(() => {
                    keySpan.textContent = originalText;
                    keySpan.style.color = originalColor;
                }, 1000);
            } catch (error) {
                console.error('Failed to copy key:', error);
            }
        };
        
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
        // Don't handle if clicked on value span or key span
        if (e.target.closest('.json-value-clickable') || e.target.closest('.json-key-clickable')) {
            return;
        }
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
            
            // Update only path display, don't re-render tree
            const pathDisplay = document.getElementById('json-finder-path-display');
            if (pathDisplay) {
                pathDisplay.textContent = convertPathToX(path);
            }
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
    // Check if valid JSON exists
    let hasValidJson = false;
    try {
        if (state.json1 && state.json1.trim() && state.json1 !== '{}') {
            JSON.parse(state.json1);
            hasValidJson = true;
        }
    } catch (e) {
        hasValidJson = false;
    }
    
    if (!hasValidJson) {
        alert('Please enter valid JSON first.');
        return;
    }
    
    if (!jsonFinderState.selectedPath) {
        alert('No path to copy. Please select an item first.');
        return;
    }
    
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
 * Download JSON input as file
 */
function downloadJsonInput() {
    const jsonText = state.json1 && state.json1.trim() && state.json1 !== '{}' ? state.json1.trim() : '';
    
    if (!jsonText) {
        alert('No JSON to download. Please enter some JSON first.');
        return;
    }
    
    try {
        JSON.parse(jsonText); // Validate
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const buttons = document.querySelectorAll('button[onclick="downloadJsonInput()"]');
        if (buttons.length > 0) {
            showButtonPopup(buttons[0], 'JSON file downloaded!');
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            alert('Invalid JSON. Please fix errors before downloading.');
        } else {
            console.error('Failed to download JSON:', error);
            alert('Failed to download JSON file');
        }
    }
}

/**
 * Upload JSON file from computer
 */
function uploadJsonInput(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        alert('Please select a valid JSON file.');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const fileContent = e.target.result;
            JSON.parse(fileContent); // Validate
            state.json1 = fileContent;
            handleJsonFinderInput(fileContent);
            
            const uploadButtons = document.querySelectorAll('label[title="Upload JSON file"]');
            if (uploadButtons.length > 0) {
                showButtonPopup(uploadButtons[0], 'JSON file uploaded!');
            }
        } catch (error) {
            alert('Invalid JSON file. Please check the file content.');
            console.error('Failed to parse uploaded JSON:', error);
        }
        event.target.value = '';
    };
    
    reader.onerror = function() {
        alert('Failed to read file. Please try again.');
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

/**
 * Copy JSON input to clipboard
 */
async function copyJsonInput() {
    const jsonText = state.json1 && state.json1.trim() && state.json1 !== '{}' ? state.json1.trim() : '';
    
    if (!jsonText) {
        alert('No JSON to copy. Please enter some JSON first.');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(jsonText);
        
        // Show feedback - temporarily show checkmark icon
        const buttons = document.querySelectorAll('button[onclick="copyJsonInput()"]');
        buttons.forEach(btn => {
            const originalContent = btn.innerHTML;
            // Temporarily show checkmark icon
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            btn.style.opacity = '0.8';
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.style.opacity = '1';
            }, 2000);
        });
        
        // Show popup tooltip near the copy button
        if (buttons.length > 0) {
            showButtonPopup(buttons[0], 'JSON Copied!');
        }
    } catch (error) {
        console.error('Failed to copy JSON:', error);
        alert('Failed to copy JSON to clipboard');
    }
}

/**
 * Generate a short random ID
 */
function generateShortId() {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36).substring(2, 8);
}

/**
 * Show popup tooltip near a button
 */
function showButtonPopup(button, message) {
    if (!button) return;
    
    // Remove any existing popup
    const existingPopup = document.getElementById('button-popup-tooltip');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'button-popup-tooltip';
    popup.textContent = message;
    popup.style.cssText = `
        position: fixed;
        background-color: ${state.darkMode ? '#1f2937' : '#374151'};
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        z-index: 10000;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        pointer-events: none;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    // Add animation keyframes if not already added
    if (!document.getElementById('button-popup-animation')) {
        const style = document.createElement('style');
        style.id = 'button-popup-animation';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-5px); }
                15% { opacity: 1; transform: translateY(0); }
                85% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Position popup relative to button
    document.body.appendChild(popup);
    const buttonRect = button.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    
    // Position above the button, centered
    popup.style.left = `${buttonRect.left + (buttonRect.width / 2) - (popupRect.width / 2)}px`;
    popup.style.top = `${buttonRect.top - popupRect.height - 8}px`;
    
    // Remove popup after animation
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 2000);
}

/**
 * Share JSON input by creating a shareable link
 */
async function shareJsonInput() {
    const jsonText = state.json1 && state.json1.trim() && state.json1 !== '{}' ? state.json1.trim() : '';
    
    if (!jsonText) {
        alert('No JSON to share. Please enter some JSON first.');
        return;
    }
    
    try {
        // Validate JSON first
        JSON.parse(jsonText);
        
        // Clean up expired entries first to free up space
        if (typeof cleanupExpiredShares === 'function') {
            cleanupExpiredShares();
        }
        
        // Check JSON size (localStorage limit is typically 5-10MB)
        const jsonSize = new Blob([jsonText]).size;
        const maxSize = 4 * 1024 * 1024; // 4MB limit (conservative, leaving room for metadata)
        
        if (jsonSize > maxSize) {
            alert(`JSON is too large to share (${(jsonSize / 1024 / 1024).toFixed(2)}MB). Maximum size is 4MB. Please use the Copy button instead.`);
            return;
        }
        
        // Always use localStorage with short ID for consistent short links
        const shareId = generateShortId();
        const storageKey = `json_share_${shareId}`;
        
        // Store JSON in localStorage with expiration (24 hours)
        const shareData = {
            json: jsonText,
            timestamp: Date.now(),
            expiresIn: 24 * 60 * 60 * 1000 // 24 hours
        };
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(shareData));
        } catch (storageError) {
            // localStorage might be full or disabled
            console.error('Failed to store in localStorage:', storageError);
            
            // Try to clean up more aggressively and retry once
            if (typeof cleanupExpiredShares === 'function') {
                cleanupExpiredShares();
                // Try to remove some old entries manually
                try {
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('json_share_')) {
                            keysToRemove.push(key);
                        }
                    }
                    // Remove oldest 5 entries
                    keysToRemove.slice(0, 5).forEach(key => localStorage.removeItem(key));
                    
                    // Retry storing
                    localStorage.setItem(storageKey, JSON.stringify(shareData));
                } catch (retryError) {
                    alert('Storage is full. Please clear some space or use the Copy button instead.');
                    return;
                }
            } else {
                alert('Storage is full. Please clear some space or use the Copy button instead.');
                return;
            }
        }
        
        // Create shareable link with index.html (always use /index.html format)
        const shareUrl = `${window.location.origin}/index.html?id=${shareId}`;
        
        // Copy link to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        // Show button feedback - temporarily show checkmark icon
        const buttons = document.querySelectorAll('button[onclick="shareJsonInput()"]');
        buttons.forEach(btn => {
            const originalContent = btn.innerHTML;
            // Temporarily show checkmark icon
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            btn.style.opacity = '0.8';
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.style.opacity = '1';
            }, 2000);
        });
        
        // Show popup tooltip near the share button
        showButtonPopup(buttons[0], 'Share link copied!');
    } catch (error) {
        if (error instanceof SyntaxError) {
            alert('Invalid JSON. Please fix errors before sharing.');
        } else {
            console.error('Failed to share JSON:', error);
            alert('Failed to create shareable link');
        }
    }
}

/**
 * Switch to JSON edit mode and format JSON if it's minified
 */
function switchToJsonMode() {
    jsonFinderState.showColored = false;
    
    // Format JSON if it's minified (single line)
    if (state.json1 && state.json1.trim() && state.json1 !== '{}' && !state.json1.includes('\n')) {
        try {
            const parsed = JSON.parse(state.json1);
            state.json1 = JSON.stringify(parsed, null, 2);
        } catch (e) {
            // Invalid JSON, skip formatting
        }
    }
    
    render();
    setTimeout(() => {
        const textarea = document.getElementById('json-finder-input');
        if (textarea) {
            textarea.setSelectionRange(0, 0);
            textarea.focus();
        }
    }, 50);
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
        const response = await fetch(`${API_BASE}/api/format`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: state.json1 })
        });
        
        if (response.ok) {
        const data = await response.json();
        if (data.formatted) {
            state.json1 = data.formatted;
                const textarea = document.getElementById('json-finder-input');
                if (textarea) {
                    textarea.value = data.formatted;
                    handleJsonFinderInput(data.formatted);
                }
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
        
        const textarea = document.getElementById('json-finder-input');
        if (textarea) {
            textarea.value = formatted;
            handleJsonFinderInput(formatted);
        }
        jsonFinderState.showColored = true;
        render();
        setTimeout(() => updateColoredPreview(), 50);
    } catch (parseError) {
        alert('Invalid JSON: ' + parseError.message);
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
            handleJsonFinderInput(minified);
        } else {
            render();
            await updateJsonFinderTree();
        }
        
        // Set cursor to leftmost position
        setTimeout(() => {
            const updatedTextarea = document.getElementById('json-finder-input');
            if (updatedTextarea) {
                updatedTextarea.setSelectionRange(0, 0);
                updatedTextarea.focus();
            }
        }, 50);
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
