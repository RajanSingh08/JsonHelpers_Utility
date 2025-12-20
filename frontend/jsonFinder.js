/**
 * JSON Finder Module - Frontend logic for JSON Finder functionality
 * Rebuilt from scratch to match jsonpathfinder.com functionality
 * Uses Vanilla JavaScript + Tailwind CSS
 */

// Note: API_BASE is defined in app.js, don't redeclare it here

// JSON Finder specific state
let jsonFinderState = {
    expandedPaths: new Set(), // Track which paths are expanded
    selectedPath: null,
    selectedValue: null
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
                    <!-- Toolbar with buttons and search -->
                    <div class="flex items-center justify-between px-3 py-2 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                        <h2 class="text-base font-semibold ${textClass} flex items-center gap-1.5">
                            <span>JSON Input</span>
                        </h2>
                        <div class="flex gap-1.5">
                            <button 
                                onclick="handleJsonFinderFormat()" 
                                class="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-xs font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1"
                                title="Format/Beautify JSON"
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
                    
                    <div style="position: relative; flex: 1; min-height: 0;">
                    <textarea 
                        id="json-finder-input" 
                            class="w-full h-full p-3 rounded border ${state.darkMode ? 'bg-gray-900 text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'} font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            style="position: relative; z-index: 2; background: ${state.darkMode ? '#111827' : '#ffffff'}; overflow-x: auto; overflow-y: auto; white-space: pre; word-wrap: normal; overflow-wrap: normal; font-size: 14px; line-height: 1.7; font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;"
                            placeholder="Paste your JSON here or start typing..."
                        oninput="handleJsonFinderInput(this.value)"
                    >${state.json1 && state.json1 !== '{}' ? state.json1 : ''}</textarea>
                    </div>
                    </div>
                </div>
                
                <!-- Right Panel: Tree View + Path Display -->
                <div class="${bgClass} flex flex-col" style="overflow: hidden;">
                    <!-- Tree View Header with search -->
                    <div class="flex justify-between items-center px-3 py-2 border-b ${borderClass}" style="flex-shrink: 0; background: ${state.darkMode ? '#1f2937' : '#f9fafb'};">
                        <h2 class="text-base font-semibold ${textClass} flex items-center gap-1.5">
                            <span>Tree View</span>
                        </h2>
                    </div>
                    
                    <!-- Search Bar for Right Panel (Non-functional) -->
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
                    
                    <!-- Tree View Container -->
                    <div 
                        id="json-finder-tree" 
                            class="flex-1 overflow-auto ${treeBg} rounded px-2 py-1 border ${borderClass} font-mono"
                            style="min-height: 0; overflow-y: auto; color: inherit; margin-top: 0; font-size: 14px; line-height: 1.7; font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;"
                    >
                        ${parsedJson ? '' : `
                            <div class="text-center ${state.darkMode ? 'text-gray-400' : 'text-gray-500'} mt-20">
                                ${jsonError ? 'Invalid JSON - please check your input' : 'Paste JSON on the left to see tree view here'}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handle JSON input changes
 */
async function handleJsonFinderInput(value) {
    state.json1 = value;
    
    // Validate JSON
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
    
    // Re-render first to update the UI
    render();
    
    // Then update tree view after render completes (DOM needs to be ready)
    setTimeout(async () => {
    await updateJsonFinderTree();
    }, 10);
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
                        return;
                    }
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
        state.json1 = JSON.stringify(parsed);
        await updateJsonFinderTree();
        render();
    } catch (error) {
        console.error('Minify error:', error);
        alert('Failed to minify JSON');
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
    render();
}
