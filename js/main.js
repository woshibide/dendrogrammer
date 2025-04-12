import { configManager } from './config/config-manager.js';
import { debugMode } from './config/default-config.js';
import { initTree, applyTreeLayout, getLayoutState, updateDimensions } from './visualization/tree-layout.js';
import { createLinkScale, getLinkWidth, getLinkGenerator, updateLinkScaleRange } from './visualization/link-renderer.js';
import { createNodes, updateNodes, updateCountBars } from './visualization/node-renderer.js';
import { loadData } from './utils/data-processor.js';
import { exportSVG } from './utils/svg-export.js';
import { initializeControls } from './ui/controls.js';
import { initPathStyle, togglePathStyle, handleToggleLayout, setupResizeHandler } from './ui/events.js';


// debug helper
function debug(...args) {
    if (debugMode) console.log('>>>', ...args);
}

// main application state
let svg, root, transform, linkScale, isRadialLayout = true;

// initialize the application
function init() {
    debug('initializing application');
    
    // initialize tree layout
    const { width, height } = initTree();
    
    // initialize zoom and transform
    transform = d3.zoomIdentity.translate(width / 2, height / 2);
    
    // set up zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([configManager.getConfig().zoom.min, configManager.getConfig().zoom.max])
        .on("zoom", zoomed);
    
    // create svg element
    svg = d3.select("#chart")
        .append("svg")
        .attr("width", "100vw")
        .attr("height", "100vh")
        .style("position", "fixed")
        .style("top", "0")
        .style("left", "0")
        .style("cursor", "grab")
        .call(zoom) 
        .append("g")
        .attr("transform", transform.toString());
    
    // set initial transform
    d3.select("#chart svg").call(zoom.transform, transform);
    
    // load data and create visualization
    loadData().then(hierarchyRoot => {
        root = hierarchyRoot;
        
        // store for global access
        d3.select("#chart").datum(root);
        
        // find range for link scale
        const minLinkValue = d3.min(root.descendants().filter(d => d.value > 0), d => d.value);
        const maxLinkValue = d3.max(root.descendants(), d => d.value);
        
        // create link scale for width
        const config = configManager.getConfig();
        linkScale = createLinkScale(minLinkValue, maxLinkValue, config);
        
        // draw the visualization
        drawVisualization();
        
        // initialize ui controls after data is loaded
        initializeControls({
            exportSVG: exportSVG,
            toggleLayout: () => {
                isRadialLayout = handleToggleLayout();
                updateVisualization();
            },
            togglePathStyle: () => {
                togglePathStyle();
                updateVisualization();
            }
        });
        
        // initialize path style from config
        initPathStyle();
    });
    
    // listen for config changes
    configManager.subscribe((id, value) => {
        updateVisualization();
    });

    // add a special config listener for layout dimensions
    configManager.subscribe((id, value, config) => {
        // detect specific layout dimension changes
        if (
            id === 'layout.radialRadiusScale' || 
            id === 'layout.clusterHeightScale' || 
            id === 'layout.clusterWidthScale'
        ) {
            // force dimensions to update
            const { width, height, radius } = updateDimensions();
            debug(`layout dimension changed: ${id}=${value}, new radius: ${radius}`);
            updateVisualization();
        }
    });
    
    // set up window resize handler
    setupResizeHandler(() => {
        updateVisualization();
    });
}

// handle zoom events
function zoomed(event) {
    if (event.sourceEvent && event.sourceEvent.type === "mousemove") {
        event.transform.k = transform.k;
    }
    transform = event.transform;
    svg.attr("transform", transform.toString());
}

// draw the visualization initially
function drawVisualization() {
    const config = configManager.getConfig();
    
    // create links
    svg.selectAll("path.link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.linkRadial().angle(d => d.x).radius(d => d.y)) 
        .attr("fill", "none")
        .attr("stroke", config.colors.link)
        .attr("stroke-opacity", config.colors.linkOpacity)
        .attr("stroke-width", getLinkWidth(linkScale));
    
    // create nodes and labels
    createNodes(svg, root);
}

// update the visualization 
function updateVisualization() {
    if (!root) {
        debug('no data to visualize');
        return;
    }

    const config = configManager.getConfig();
    
    debug('updating visualization', {
        layout: isRadialLayout ? 'radial' : 'horizontal',
        pathStyle: config.layout.pathStyle
    });

    // re-run tree layout
    applyTreeLayout(root);

    // update link scale range when config changes
    updateLinkScaleRange(linkScale, config);

    // update links
    svg.selectAll("path.link")
        .attr("d", d => {
            // get the appropriate link generator
            const linkGen = getLinkGenerator(isRadialLayout, config.layout.pathStyle);
            return linkGen(d);
        })
        .attr("stroke", config.colors.link)
        .attr("stroke-opacity", config.colors.linkOpacity)
        .attr("stroke-width", getLinkWidth(linkScale)); // this now uses updated scale

    // update count bars specifically when relevant configs change
    updateCountBars(svg, root);

    // update nodes and labels
    updateNodes(svg, isRadialLayout);
}

// initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);