import { configManager } from '../config/config-manager.js';
import { debugMode } from '../config/default-config.js';

// debug helper
function debug(...args) {
    if (debugMode) console.log('>>>', ...args);
}

// update the displayed value for a control
export function updateValueDisplay(id, value) {
    const valueDisplay = document.getElementById(`${id}_value`);
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
}

// initialize all ui controls
export function initializeControls(callbacks) {
    const config = configManager.getConfig();
    
    debug("Initializing controls with colors:", {
        parent: config.colors.nodeParent,
        leaf: config.colors.nodeLeaf,
        link: config.colors.link
    });
    
    // set initial values for ranges
    document.getElementById('radialScale').value = config.layout.radialRadiusScale;
    document.getElementById('clusterHeight').value = config.layout.clusterHeightScale;
    document.getElementById('clusterWidth').value = config.layout.clusterWidthScale;
    document.getElementById('nodeRadius').value = config.layout.nodeRadius;
    document.getElementById('labelOffset').value = config.layout.labelOffset;
    document.getElementById('nodeParentColor').value = config.colors.nodeParent;
    document.getElementById('nodeLeafColor').value = config.colors.nodeLeaf;
    document.getElementById('linkColor').value = config.colors.link;
    document.getElementById('linkOpacity').value = config.colors.linkOpacity;
    document.getElementById('fontSizeParent').value = config.fontSize.parent;
    document.getElementById('fontSizeLeaf').value = config.fontSize.leaf;
    document.getElementById('linkMinWidth').value = config.links.minWidth;
    document.getElementById('linkMaxWidth').value = config.links.maxWidth;
    document.getElementById('countBarHeight').value = config.layout.countBarHeight;
    document.getElementById('countBarScale').value = config.layout.countBarScale;
    document.getElementById('countBarExponent').value = config.layout.countBarExponent;

    // display values for labels
    Object.entries({
        radialScale: config.layout.radialRadiusScale,
        clusterHeight: config.layout.clusterHeightScale,
        clusterWidth: config.layout.clusterWidthScale,
        nodeRadius: config.layout.nodeRadius,
        labelOffset: config.layout.labelOffset,
        nodeParentColor: config.colors.nodeParent,
        nodeLeafColor: config.colors.nodeLeaf,
        linkColor: config.colors.link,
        linkOpacity: config.colors.linkOpacity,
        fontSizeParent: config.fontSize.parent,
        fontSizeLeaf: config.fontSize.leaf,
        linkMinWidth: config.links.minWidth,
        linkMaxWidth: config.links.maxWidth,
        countBarHeight: config.layout.countBarHeight,
        countBarScale: config.layout.countBarScale,
        countBarExponent: config.layout.countBarExponent
    }).forEach(([id, value]) => updateValueDisplay(id, value));

    // set up input event listeners
    const controls = document.querySelectorAll('#controlPanel input');
    controls.forEach(control => {
        control.addEventListener('input', updateConfig);
    });

    // set up clamp value listeners
    setupClampInputs();
    
    // setup color input listeners
    setupColorInputs();
    
    // button event listeners
    document.getElementById("exportBtn").addEventListener("click", callbacks.exportSVG);
    document.getElementById("toggleBtn").addEventListener("click", callbacks.toggleLayout);
    document.getElementById("resetBtn").addEventListener("click", resetConfig);
    document.getElementById("pathStyleBtn").addEventListener("click", callbacks.togglePathStyle);
}

// set up min/max clamp inputs
function setupClampInputs() {
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(range => {
        const baseId = range.id;
        const minInput = document.getElementById(`${baseId}_min`);
        const maxInput = document.getElementById(`${baseId}_max`);

        minInput.addEventListener('change', () => {
            range.min = minInput.value;
            if (parseFloat(range.value) < parseFloat(minInput.value)) {
                range.value = minInput.value;
                updateConfig({ target: range });
            }
        });

        maxInput.addEventListener('change', () => {
            range.max = maxInput.value;
            if (parseFloat(range.value) > parseFloat(maxInput.value)) {
                range.value = maxInput.value;
                updateConfig({ target: range });
            }
        });
    });
}

// set up color input listeners
function setupColorInputs() {
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            debug(`color ${e.target.id} changed to:`, e.target.value);
            // make sure to trigger the regular update config function
            updateConfig(e);
        });
    });
}

// handle config updates from controls
function updateConfig(event) {
    const id = event.target.id;
    const value = event.target.type === 'range' ? parseFloat(event.target.value) : event.target.value;
    
    debug('Config update:', id, value);
    updateValueDisplay(id, value);

    // update config properties based on control id
    let configPath = '';
    
    switch (id) {
        case 'radialScale':
            configPath = 'layout.radialRadiusScale';
            break;
        case 'clusterHeight':
            configPath = 'layout.clusterHeightScale';
            break;
        case 'clusterWidth':
            configPath = 'layout.clusterWidthScale';
            break;
        case 'nodeRadius':
            configPath = 'layout.nodeRadius';
            break;
        case 'labelOffset':
            configPath = 'layout.labelOffset';
            break;
        case 'nodeParentColor':
            configPath = 'colors.nodeParent';
            break;
        case 'nodeLeafColor':
            configPath = 'colors.nodeLeaf';
            break;
        case 'linkColor':
            configPath = 'colors.link';
            break;
        case 'linkOpacity':
            configPath = 'colors.linkOpacity';
            break;
        case 'fontSizeParent':
            configPath = 'fontSize.parent';
            break;
        case 'fontSizeLeaf':
            configPath = 'fontSize.leaf';
            break;
        case 'linkMinWidth':
            configPath = 'links.minWidth';
            break;
        case 'linkMaxWidth':
            configPath = 'links.maxWidth';
            break;
        case 'countBarHeight':
            configPath = 'layout.countBarHeight';
            break;
        case 'countBarScale':
            configPath = 'layout.countBarScale';
            break;
        case 'countBarExponent':
            configPath = 'layout.countBarExponent';
            break;
    }
    
    // update the configuration
    if (configPath) {
        configManager.update(configPath, value);
    }
}

// reset all configuration values
export function resetConfig() {
    debug('resetting configuration to initial state');

    // blink animation
    const controlPanel = document.getElementById('controlPanel');
    const children = controlPanel.querySelectorAll('*');
    controlPanel.classList.add('blinking');
    children.forEach(child => child.classList.add('blinking'));

    controlPanel.addEventListener('animationend', () => {
        controlPanel.classList.remove('blinking');
        children.forEach(child => child.classList.remove('blinking'));
    }, { once: true });

    // reset config to initial values
    configManager.reset();
    
    // reset UI controls
    const config = configManager.getConfig();
    document.getElementById('radialScale').value = config.layout.radialRadiusScale;
    document.getElementById('clusterHeight').value = config.layout.clusterHeightScale;
    document.getElementById('clusterWidth').value = config.layout.clusterWidthScale;
    document.getElementById('nodeRadius').value = config.layout.nodeRadius;
    document.getElementById('labelOffset').value = config.layout.labelOffset;
    document.getElementById('nodeParentColor').value = config.colors.nodeParent;
    document.getElementById('nodeLeafColor').value = config.colors.nodeLeaf;
    document.getElementById('linkColor').value = config.colors.link;
    document.getElementById('linkOpacity').value = config.colors.linkOpacity;
    document.getElementById('fontSizeParent').value = config.fontSize.parent;
    document.getElementById('fontSizeLeaf').value = config.fontSize.leaf;
    document.getElementById('linkMinWidth').value = config.links.minWidth;
    document.getElementById('linkMaxWidth').value = config.links.maxWidth;
    document.getElementById('countBarHeight').value = config.layout.countBarHeight;
    document.getElementById('countBarScale').value = config.layout.countBarScale;
    document.getElementById('countBarExponent').value = config.layout.countBarExponent;

    // update all value displays
    Object.entries({
        radialScale: config.layout.radialRadiusScale,
        clusterHeight: config.layout.clusterHeightScale,
        clusterWidth: config.layout.clusterWidthScale,
        nodeRadius: config.layout.nodeRadius,
        labelOffset: config.layout.labelOffset,
        nodeParentColor: config.colors.nodeParent,
        nodeLeafColor: config.colors.nodeLeaf,
        linkColor: config.colors.link,
        linkOpacity: config.colors.linkOpacity,
        fontSizeParent: config.fontSize.parent,
        fontSizeLeaf: config.fontSize.leaf,
        linkMinWidth: config.links.minWidth,
        linkMaxWidth: config.links.maxWidth,
        countBarHeight: config.layout.countBarHeight,
        countBarScale: config.layout.countBarScale,
        countBarExponent: config.layout.countBarExponent
    }).forEach(([id, value]) => updateValueDisplay(id, value));

    // notify that a full reset was performed (special case)
    configManager.update('*', null);

    debug('configuration reset complete');
}