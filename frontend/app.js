const API_BASE = 'http://localhost:5000';

// State
let state = {
    json1: '{}',
    json2: '{}',
    currentMode: 'finder',
    errors: { json1: null, json2: null },
    darkMode: true
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    try {
        render();
    } catch (error) {
        console.error('Error during initialization:', error);
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = `<div style="padding: 20px; color: red;">
                <h1>Error Loading Application</h1>
                <p>${error.message}</p>
                <pre>${error.stack}</pre>
            </div>`;
        }
    }
});

async function validateJSON(jsonStr, panel) {
    const panelKey = typeof panel === 'number' ? (panel === 1 ? 'json1' : 'json2') : panel;
    if (!jsonStr || !jsonStr.trim()) {
        state.errors[panelKey] = null;
        if (document.getElementById('root')) render();
        return true;
    }
    try {
        JSON.parse(jsonStr);
        state.errors[panelKey] = null;
        if (document.getElementById('root')) render();
    } catch (parseError) {
        state.errors[panelKey] = `Invalid JSON: ${parseError.message}`;
        if (document.getElementById('root')) render();
    }
    try {
        const response = await fetch(`${API_BASE}/api/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: jsonStr })
        });
        const data = await response.json();
        if (state.errors[panelKey] !== (data.valid ? null : data.error)) {
            state.errors[panelKey] = data.valid ? null : data.error;
            if (document.getElementById('root')) render();
        }
    } catch (error) {
        // Ignore network errors if client-side parse succeeded
    }
}

function render() {
    try {
        const root = document.getElementById('root');
        if (!root) return;
        
        if (typeof state === 'undefined') {
            root.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: State not initialized</h1></div>';
            return;
        }
        
        if (typeof renderFinderMode === 'undefined' && state.currentMode === 'finder') {
            root.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: renderFinderMode not defined</h1></div>';
            return;
        }
        
        const bgClass = state.darkMode ? 'bg-gray-900' : 'bg-gray-50';
        const textClass = state.darkMode ? 'text-gray-100' : 'text-gray-900';
        
        root.innerHTML = `
        <div class="min-h-screen ${bgClass} ${textClass}" style="min-height: 100vh; margin: 0; padding: 0;">
            <header class="${state.darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${state.darkMode ? 'border-gray-700' : 'border-gray-200'} px-3 py-2">
                <div class="flex justify-between items-center">
                    <h1 class="text-lg font-bold">🔧 JSON Helper</h1>
                    <div class="flex gap-1.5 items-center">
                        <button onclick="state.currentMode = 'finder'; render();" class="px-2.5 py-1 rounded text-xs ${state.currentMode === 'finder' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}">JSON Finder</button>
                        <button onclick="state.currentMode = 'compare'; render();" class="px-2.5 py-1 rounded text-xs ${state.currentMode === 'compare' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}">Compare Jsons</button>
                        <button onclick="state.darkMode = !state.darkMode; render();" class="px-2.5 py-1 rounded text-xs ${state.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}">${state.darkMode ? '☀️ Bright' : '🌙 Dark'}</button>
                    </div>
                </div>
            </header>
            <main class="w-full" style="padding: 0; margin: 0;">
                ${state.currentMode === 'finder' ? renderFinderMode() : renderCompareMode()}
            </main>
        </div>
    `;
        
        // After rendering finder mode, update the views based on current mode
        if (state.currentMode === 'finder') {
            setTimeout(() => {
                if (typeof jsonFinderState !== 'undefined') {
                    // Update colored preview if enabled
                    if (jsonFinderState.showColored && typeof updateColoredPreview !== 'undefined') {
                        updateColoredPreview();
                    }
                    
                    // Update right panel based on view mode
                    if (jsonFinderState.viewMode === 'treeViewer') {
                        if (typeof updateTreeViewer !== 'undefined') {
                            updateTreeViewer();
                        }
                    } else if (typeof updateJsonFinderTree !== 'undefined') {
                        updateJsonFinderTree();
                    }
                }
            }, 50);
        }
    } catch (error) {
        console.error('Error in render():', error);
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = `<div style="padding: 20px; color: red;">
                <h1>Error Rendering Application</h1>
                <p>${error.message}</p>
                <pre>${error.stack}</pre>
            </div>`;
        }
    }
    
}


