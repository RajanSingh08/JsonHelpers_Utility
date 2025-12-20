/**
 * Compare JSON Module - Frontend logic for JSON comparison functionality
 * Handles: JSON comparison, diff display
 */

function renderCompareMode() {
    let parsedJson1, parsedJson2;
    try {
        parsedJson1 = JSON.parse(state.json1);
    } catch {
        parsedJson1 = null;
    }
    try {
        parsedJson2 = JSON.parse(state.json2);
    } catch {
        parsedJson2 = null;
    }
    
    const bgClass = state.darkMode ? 'bg-gray-800' : 'bg-white';
    const borderClass = state.darkMode ? 'border-gray-700' : 'border-gray-200';
    
    return `
        <div class="grid grid-cols-2" style="gap: 12px;">
            <div class="${bgClass} rounded-lg shadow border ${borderClass} p-4">
                <h2 class="text-lg font-semibold mb-3">JSON 1</h2>
                <textarea id="textarea1" class="w-full h-96 p-3 rounded border font-mono text-sm ${state.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}" placeholder="Paste your JSON here..." oninput="state.json1 = this.value; validateJSON(state.json1, 'json1'); render();" onpaste="setTimeout(() => { state.json1 = this.value; validateJSON(state.json1, 'json1'); render(); }, 10);">${state.json1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                ${state.errors.json1 ? `<div class="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">${state.errors.json1}</div>` : ''}
            </div>
            <div class="${bgClass} rounded-lg shadow border ${borderClass} p-4">
                <h2 class="text-lg font-semibold mb-3">JSON 2</h2>
                <textarea id="textarea2" class="w-full h-96 p-3 rounded border font-mono text-sm ${state.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}" placeholder="Paste your JSON here..." oninput="state.json2 = this.value; validateJSON(state.json2, 'json2'); render();" onpaste="setTimeout(() => { state.json2 = this.value; validateJSON(state.json2, 'json2'); render(); }, 10);">${state.json2.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                ${state.errors.json2 ? `<div class="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">${state.errors.json2}</div>` : ''}
            </div>
        </div>
    `;
}

