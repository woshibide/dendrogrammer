// radial link generators
export const radialLinkSmooth = d3.linkRadial()
    .angle(d => d.x)
    .radius(d => d.y);

// straight line between radial points
export function radialLinkStraight(d) {
    const startAngle = d.source.x;
    const startRadius = d.source.y;
    const endAngle = d.target.x;
    const endRadius = d.target.y;
    
    const x1 = startRadius * Math.cos(startAngle - Math.PI/2);
    const y1 = startRadius * Math.sin(startAngle - Math.PI/2);
    const x2 = endRadius * Math.cos(endAngle - Math.PI/2);
    const y2 = endRadius * Math.sin(endAngle - Math.PI/2);
    
    return `M${x1},${y1}L${x2},${y2}`;
}

// elbow path between radial points 
export function radialLinkElbow(d) {
    const startAngle = d.source.x;
    const startRadius = d.source.y;
    const endAngle = d.target.x;
    const endRadius = d.target.y;
    
    // calculate midpoint for the elbow
    const midRadius = (startRadius + endRadius) / 2;
    
    // convert to cartesian coordinates
    const x1 = startRadius * Math.cos(startAngle - Math.PI/2);
    const y1 = startRadius * Math.sin(startAngle - Math.PI/2);
    
    // mid point (same angle as start, but at mid radius)
    const xMid = midRadius * Math.cos(startAngle - Math.PI/2);
    const yMid = midRadius * Math.sin(startAngle - Math.PI/2);
    
    // mid point (same angle as end, but at mid radius)
    const xMid2 = midRadius * Math.cos(endAngle - Math.PI/2);
    const yMid2 = midRadius * Math.sin(endAngle - Math.PI/2);
    
    // end point
    const x2 = endRadius * Math.cos(endAngle - Math.PI/2);
    const y2 = endRadius * Math.sin(endAngle - Math.PI/2);
    
    // create path with elbow points
    return `M${x1},${y1}L${xMid},
            ${yMid}A${midRadius},
            ${midRadius} 0 0,
            ${startAngle < endAngle ? 1 : 0} ${xMid2},
            ${yMid2}L${x2},${y2}`;
}

// horizontal link generators
export const horizontalLinkSmooth = d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

// straight line between horizontal points
export function horizontalLinkStraight(d) {
    return `M${d.source.y},${d.source.x}L${d.target.y},${d.target.x}`;
}

// elbow path between horizontal points
export function horizontalLinkElbow(d) {
    return `M${d.source.y},${d.source.x}
            H${(d.source.y + d.target.y) / 2}
            V${d.target.x}
            H${d.target.y}`;
}

// get appropriate link generator based on layout and style
export function getLinkGenerator(isRadial, style) {
    if (isRadial) {
        if (style === "smooth") return radialLinkSmooth;
        if (style === "elbow") return radialLinkElbow;
        return radialLinkStraight;
    } else {
        if (style === "smooth") return horizontalLinkSmooth;
        if (style === "elbow") return horizontalLinkElbow;
        return horizontalLinkStraight;
    }
}

// create link scale for width calculations
export function createLinkScale(minValue, maxValue, config) {
    return d3.scaleLinear()
        .domain([minValue || 1, maxValue])
        .range([config.links.minWidth, config.links.maxWidth]);
}

// get link width function using scale
export function getLinkWidth(linkScale) {
    return d => linkScale(d.target.value);
}

// add this function to update the link scale range
export function updateLinkScaleRange(linkScale, config) {
    if (!linkScale) return;
    linkScale.range([config.links.minWidth, config.links.maxWidth]);
    return linkScale;
}