import { configManager } from '../config/config-manager.js';

// calculate bar width for count indicators
export function calculateBarWidth(value, maxValue) {
    const config = configManager.getConfig();
    
    // apply non-linear mapping with exponent
    const normalizedValue = Math.pow(value / maxValue, config.layout.countBarExponent);
    // apply scaling factor
    return normalizedValue * config.layout.countBarMaxWidth * config.layout.countBarScale;
}

// determine transform for nodes based on layout
export function getNodeTransform(d, isRadialLayout) {
    if (isRadialLayout) {
        return `rotate(${(d.x * 180 / Math.PI - 90)})translate(${d.y},0)`;
    } else {
        return `translate(${d.y},${d.x})`;
    }
}

// determine text positioning and rotation
export function getTextAttributes(d, isRadialLayout) {
    const config = configManager.getConfig();
    
    const attributes = {
        fontSize: d.children ? 
            `${config.fontSize.parent}px` : 
            `${config.fontSize.leaf}px`,
        transform: null,
        textAnchor: 'start',
        x: config.layout.labelOffset
    };
    
    if (isRadialLayout) {
        // adjust for position in circle
        if (d.x >= Math.PI) {
            attributes.transform = "rotate(180)";
            attributes.textAnchor = d.children ? "start" : "end";
            attributes.x = -config.layout.labelOffset;
        } else {
            attributes.textAnchor = d.children ? "end" : "start";
            attributes.x = d.children ? -config.layout.labelOffset : config.layout.labelOffset;
        }
    } else {
        // horizontal layout 
        attributes.transform = "rotate(0)";
        attributes.textAnchor = d.children ? "end" : "start";
        attributes.x = d.children ? -config.layout.labelOffset : config.layout.labelOffset;
    }
    
    return attributes;
}

// determine position for count bars
export function getCountBarX(d, isRadialLayout) {
    const config = configManager.getConfig();
    
    if (isRadialLayout && d.x >= Math.PI) {
        // radial layout, right side
        return -config.layout.nodeRadius;
    } else {
        // left side or horizontal layout
        return config.layout.nodeRadius;
    }
}

// create node visualization elements
export function createNodes(svg, root) {
    const config = configManager.getConfig();
    
    // nodes
    const node = svg.selectAll("g.node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => getNodeTransform(d, true)); // start with radial
    
    // add circles
    node.append("circle")
        .attr("r", config.layout.nodeRadius)
        .attr("fill", d => d.children ? config.colors.nodeParent : config.colors.nodeLeaf);
    
    // add labels
    node.append("text")
        .text(d => d.data.name)
        .attr("class", d => d.children ? "inner-label" : "leaf-label")
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .attr("x", d => d.x < Math.PI === !d.children ? config.layout.labelOffset : -config.layout.labelOffset)
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .style("fill", config.colors.fontColor)
        .style("font-size", d => d.children ? 
            `${config.fontSize.parent}px` : 
            `${config.fontSize.leaf}px`);
    
    // calculate max value for count bars
    const maxValue = d3.max(root.leaves(), leaf => leaf.value || 0);
    
    // add count bars for leaf nodes
    node.filter(d => !d.children)
        .append("rect")
        .attr("class", "count-bar")
        .attr("x", d => getCountBarX(d, true))
        .attr("y", -config.layout.countBarHeight / 2)
        .attr("height", config.layout.countBarHeight)
        .attr("width", d => calculateBarWidth(d.value, maxValue))
        .attr("fill", config.colors.countBar)
        .attr("opacity", 0.5);
        
    return { node, maxValue };
}

// update nodes when configuration changes
export function updateNodes(svg, isRadialLayout) {
    const config = configManager.getConfig();
    
    // update node positions
    svg.selectAll("g.node")
        .attr("transform", d => getNodeTransform(d, isRadialLayout));
    
    // update node circles
    svg.selectAll("circle")
        .attr("r", config.layout.nodeRadius)
        .attr("fill", d => d.children ? config.colors.nodeParent : config.colors.nodeLeaf);
    
    // update count bar positions and properties
    svg.selectAll("rect.count-bar")
        .attr("x", d => getCountBarX(d, isRadialLayout))
        .attr("y", -config.layout.countBarHeight / 2)
        .attr("height", config.layout.countBarHeight)
        .attr("fill", config.colors.countBar);
    
    // update text positioning and styling
    svg.selectAll("text")
        .style("font-size", d => {
            const size = d.children ? 
                `${config.fontSize.parent}px` : 
                `${config.fontSize.leaf}px`;
            return size;
        })
        .style("fill", config.colors.fontColor)
        .attr("transform", d => {
            if (isRadialLayout) {
                return d.x >= Math.PI ? "rotate(180)" : null;
            }
            return "rotate(0)";
        })
        .attr("text-anchor", d => {
            if (isRadialLayout) {
                return d.x < Math.PI === !d.children ? "start" : "end";
            }
            return d.children ? "end" : "start";
        })
        .attr("x", d => {
            if (isRadialLayout) {
                return d.x < Math.PI === !d.children ? 
                    config.layout.labelOffset : 
                    -config.layout.labelOffset;
            }
            return d.children ? -config.layout.labelOffset : config.layout.labelOffset;
        });
}

// add this function to update count bars
export function updateCountBars(svg, root) {
    if (!root || !svg) return;
    
    const config = configManager.getConfig();
    
    // find max value for scaling
    const maxValue = d3.max(root.leaves(), leaf => leaf.value || 0);
    
    // update all count bar widths
    svg.selectAll("rect.count-bar")
       .attr("width", d => calculateBarWidth(d.value, maxValue));
}