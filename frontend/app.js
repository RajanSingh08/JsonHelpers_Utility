const API_BASE = 'http://localhost:5000';

// State
let state = {
    json1: '{}',
    json2: '{}',
    currentMode: 'finder',
    errors: { json1: null, json2: null },
    darkMode: true
};

/**
 * Clean up expired shared JSON entries from localStorage
 */
function cleanupExpiredShares() {
    try {
        const now = Date.now();
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('json_share_')) {
                try {
                    const storedData = JSON.parse(localStorage.getItem(key));
                    if (now - storedData.timestamp > storedData.expiresIn) {
                        keysToRemove.push(key);
                    }
                } catch (e) {
                    // Invalid data, remove it
                    keysToRemove.push(key);
                }
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
        console.warn('Failed to cleanup expired shares:', e);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check if JSON is provided in URL
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check for share ID first (for large JSON stored in localStorage)
        const shareId = urlParams.get('id');
        if (shareId) {
            try {
                const storageKey = `json_share_${shareId}`;
                const storedData = localStorage.getItem(storageKey);
                
                if (storedData) {
                    const shareData = JSON.parse(storedData);
                    const now = Date.now();
                    
                    // Check if expired
                    if (now - shareData.timestamp > shareData.expiresIn) {
                        localStorage.removeItem(storageKey);
                        alert('This shared link has expired (24 hours).');
                    } else {
                        // Validate it's valid JSON
                        JSON.parse(shareData.json);
                        state.json1 = shareData.json;
                        // Clean up old expired entries
                        cleanupExpiredShares();
                    }
                } else {
                    alert('Shared link not found or has expired.');
                }
            } catch (e) {
                console.warn('Failed to load shared JSON from localStorage:', e);
                alert('Failed to load shared JSON. The link may have expired.');
            }
        } else {
            // Check for direct JSON in URL (for small JSON)
            const jsonParam = urlParams.get('json');
            if (jsonParam) {
                try {
                    // Decode base64 JSON from URL
                    const decodedJson = decodeURIComponent(escape(atob(jsonParam)));
                    // Validate it's valid JSON
                    JSON.parse(decodedJson);
                    state.json1 = decodedJson;
                } catch (e) {
                    console.warn('Invalid JSON in URL parameter:', e);
                }
            }
        }
        
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

// Update error display without full render
function updateErrorDisplay(panelKey) {
    if (state.currentMode !== 'compare') return;
    
    const panel = panelKey === 'json1' ? 1 : 2;
    const textarea = document.getElementById(`compare-textarea${panel}`);
    if (!textarea) return;
    
    const panelContainer = textarea.closest('.flex.flex-col');
    if (!panelContainer) return;
    
    // Find error container
    let errorContainer = panelContainer.querySelector('.error-container');
    if (!errorContainer) return;
    
    const borderClass = state.darkMode ? 'border-gray-700' : 'border-gray-200';
    
    if (state.errors[panelKey]) {
        errorContainer.innerHTML = `<div class="px-2 py-1 border-t ${borderClass}" style="flex-shrink: 0;"><div class="p-1 ${state.darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded text-xs">${escapeHtml(state.errors[panelKey])}</div></div>`;
        errorContainer.style.display = 'block';
    } else {
        errorContainer.innerHTML = '';
        errorContainer.style.display = 'none';
    }
}

async function validateJSON(jsonStr, panel) {
    const panelKey = typeof panel === 'number' ? (panel === 1 ? 'json1' : 'json2') : panel;
    const root = document.getElementById('root');
    if (!root) return;
    
    if (!jsonStr || !jsonStr.trim()) {
        state.errors[panelKey] = null;
        updateErrorDisplay(panelKey);
        return;
    }
    
    try {
        JSON.parse(jsonStr);
        state.errors[panelKey] = null;
        updateErrorDisplay(panelKey);
    } catch (parseError) {
        state.errors[panelKey] = `Invalid JSON: ${parseError.message}`;
        updateErrorDisplay(panelKey);
    }
    
    // Async validation with backend (non-blocking)
    try {
        const response = await fetch(`${API_BASE}/api/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: jsonStr })
        });
        const data = await response.json();
        const newError = data.valid ? null : data.error;
        if (state.errors[panelKey] !== newError) {
            state.errors[panelKey] = newError;
            updateErrorDisplay(panelKey);
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
            <header class="${state.darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-white to-gray-50'} border-b ${state.darkMode ? 'border-gray-700' : 'border-gray-200'} px-4 py-3 shadow-sm">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <h1 class="text-xl font-bold ${state.darkMode ? 'text-white' : 'text-gray-900'}">🔧 JSON Helper</h1>
                        <span class="text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium">powered by</span>
                        <a href="https://www.ratl.ai/" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold ${state.darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors">ratl.ai</a>
                    </div>
                    <div class="flex gap-2 items-center">
                        <button onclick="state.currentMode = 'finder'; render();" class="px-3 py-1.5 rounded-md text-xs font-medium transition-all ${state.currentMode === 'finder' ? 'bg-blue-600 text-white shadow-md' : state.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">JSON Finder</button>
                        <button onclick="state.currentMode = 'compare'; render();" class="px-3 py-1.5 rounded-md text-xs font-medium transition-all ${state.currentMode === 'compare' ? 'bg-blue-600 text-white shadow-md' : state.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">Compare Jsons</button>
                        <button onclick="state.darkMode = !state.darkMode; render();" class="px-3 py-1.5 rounded-md text-xs font-medium transition-all ${state.darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}">${state.darkMode ? '☀️ Bright' : '🌙 Dark'}</button>
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
        } else if (state.currentMode === 'compare') {
            // After rendering compare mode, ensure textarea values are set correctly and initialize line numbers
            setTimeout(() => {
                const textarea1 = document.getElementById('compare-textarea1');
                const textarea2 = document.getElementById('compare-textarea2');
                if (textarea1) {
                    textarea1.value = state.json1 && state.json1 !== '{}' ? state.json1 : '';
                    if (typeof updateLineNumbers !== 'undefined') {
                        updateLineNumbers('compare-textarea1', 'compare-line-numbers1');
                    }
                }
                if (textarea2) {
                    textarea2.value = state.json2 && state.json2 !== '{}' ? state.json2 : '';
                    if (typeof updateLineNumbers !== 'undefined') {
                        updateLineNumbers('compare-textarea2', 'compare-line-numbers2');
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
