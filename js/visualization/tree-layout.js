import { debugMode } from '../config/default-config.js';
import { configManager } from '../config/config-manager.js';

// debug helper
function debug(...args) {
    if (debugMode) console.log('>>>', ...args);
}

let width, height, radius;
let isRadialLayout = true;
let tree; // keep tree reference at module level

// initialize the tree layout
export function initTree() {
    const config = configManager.getConfig();
    const dims = calculateDimensions();
    width = dims.width;
    height = dims.height;
    radius = dims.radius;
    
    // create d3 tree layout
    tree = d3.tree().size([2 * Math.PI, radius]);
    
    return {
        tree,
        width,
        height,
        radius,
        isRadialLayout
    };
}

// apply tree layout to hierarchy data
export function applyTreeLayout(root) {
    if (!tree) {
        debug('error: tree is not initialized');
        return;
    }
    return tree(root);
}

// recalculate dimensions on window resize
export function updateDimensions() {
    const config = configManager.getConfig();
    
    const dims = calculateDimensions();
    width = dims.width;
    height = dims.height;
    
    // get fresh radius value based on current config
    radius = Math.min(width, height) * config.layout.radialRadiusScale;
    
    // update tree size based on layout
    updateTreeSize();
    
    return { width, height, radius };
}

// toggle between layouts
export function toggleLayout() {
    isRadialLayout = !isRadialLayout;
    updateTreeSize();
    return isRadialLayout;
}

// update tree size based on layout and dimensions
function updateTreeSize() {
    const config = configManager.getConfig();
    
    if (isRadialLayout) {
        // explicitly use current config value 
        tree.size([2 * Math.PI, radius]);
    } else {
        // explicitly use current config values
        tree.size([
            height * config.layout.clusterHeightScale,
            width * config.layout.clusterWidthScale
        ]);
    }
}

// calculate dimensions based on window size and config
export function calculateDimensions() {
    const config = configManager.getConfig();
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        radius: Math.min(window.innerWidth, window.innerHeight) * config.layout.radialRadiusScale
    };
}

// process data into hierarchy
export function processHierarchy(data) {
    debug('Processing data into hierarchy');
    
    const rootData = { name: "rewire content", children: [] };
    const categoryMap = new Map();

    data.forEach(d => {
        const category = d.Category;
        const composition = d.Composition;
        const artist = d.Artist;
        const count = +d.Count; // convert count to a number

        // retrieve the category node or create it if it doesn't exist
        if (!categoryMap.has(category)) {
            const categoryNode = { name: category, children: [] };
            categoryMap.set(category, categoryNode);
            rootData.children.push(categoryNode);
        }
        const categoryNode = categoryMap.get(category);

        // retrieve the composition node within the category or create it
        let compositionNode = categoryNode.children.find(c => c.name === composition);
        if (!compositionNode) {
            compositionNode = { name: composition, children: [] };
            categoryNode.children.push(compositionNode);
        }

        // add leaf
        compositionNode.children.push({ name: artist, value: count });
    });
    
    // convert to d3 hierarchy
    const root = d3.hierarchy(rootData, d => d.children);
    root.sum(d => d.value || 0);
    
    // apply the tree layout
    applyTreeLayout(root);
    
    return root;
}

// get current layout state
export function getLayoutState() {
    return {
        isRadialLayout,
        width,
        height, 
        radius,
        tree
    };
}