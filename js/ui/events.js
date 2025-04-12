import { debugMode } from '../config/default-config.js';
import { configManager } from '../config/config-manager.js';
import { updateDimensions, toggleLayout } from '../visualization/tree-layout.js';

// debug helper
function debug(...args) {
    if (debugMode) console.log('>>>', ...args);
}

// path style state
let pathStyles = ["smooth", "elbow", "straight"];
let currentPathStyleIndex = 0; // will be set in init

// initialize path style from config
export function initPathStyle() {
    const config = configManager.getConfig();
    currentPathStyleIndex = pathStyles.indexOf(config.layout.pathStyle);
    
    // update button text
    updatePathStyleButtonText();
}

// toggle through available path styles
export function togglePathStyle() {
    // cycle through path styles
    currentPathStyleIndex = (currentPathStyleIndex + 1) % pathStyles.length;
    const style = pathStyles[currentPathStyleIndex];
    
    // update config
    configManager.update('layout.pathStyle', style);
    
    // update button text
    updatePathStyleButtonText();
    
    return style;
}

// update the path style button text
function updatePathStyleButtonText() {
    const style = pathStyles[currentPathStyleIndex];
    document.getElementById('pathStyleBtn').textContent = 
        style === "smooth" ? 'SMOOTH PATHS' : 
        style === "elbow" ? 'ELBOW PATHS' : 'STRAIGHT PATHS';
}

// toggle between radial and horizontal layout
export function handleToggleLayout() {
    const isRadialLayout = toggleLayout();
    
    // update button text
    document.getElementById('toggleBtn').textContent = 
        isRadialLayout ? 'RADIAL' : 'HORIZONTAL';
    
    debug('Layout changed to:', isRadialLayout ? 'radial' : 'horizontal');
    
    return isRadialLayout;
}

// handle window resize events
export function setupResizeHandler(callback) {
    window.addEventListener('resize', () => {
        debug('Window resized:', {
            width: window.innerWidth,
            height: window.innerHeight
        });

        // update dimensions
        const dims = updateDimensions();
        
        // callback to update visualization
        if (callback) callback(dims);
    });
}