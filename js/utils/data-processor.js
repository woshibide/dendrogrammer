import { debugMode, pathToCSV } from '../config/default-config.js';
import { processHierarchy } from '../visualization/tree-layout.js';

// debug helper
function debug(...args) {
    if (debugMode) console.log('>>>', ...args);
}

// load csv data and process it into hierarchy
export function loadData() {
    return d3.csv(pathToCSV)
        .then(data => {
            debug('CSV loaded, rows:', data.length);

            // update csv filename in marquee
            document.getElementById('csvFileName').textContent = pathToCSV;
            
            // process into hierarchy structure
            const root = processHierarchy(data);
            
            debug('Hierarchy created:', {
                nodes: root.descendants().length,
                depth: root.height,
                totalValue: root.value
            });
            
            return root;
        })
        .catch(error => {
            debug('Error loading CSV:', error);
            throw error;
        });
}