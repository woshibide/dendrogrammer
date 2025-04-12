

/**
 * @fileOverview This file contains the default configuration settings for the dendrogram visualization.
 * It includes settings for file paths, debug mode, colors, zoom levels, layout parameters, font sizes, and link properties.
 */
export const pathToCSV = "for_Rewire_design_team-data_set.csv";


export const debugMode = true;


export const CONFIG = {
    colors: {
        nodeParent: "#ff0035",
        nodeLeaf: "#ff0035",
        link: "#ff0035",
        linkOpacity: 0.2,
        countBar: "#ff0035",
        fontColor: "#ff0035",
    },
    zoom: {
        min: 0.1,
        max: 4
    },
    layout: {
        radialRadiusScale: 0.5,     // for radial view
        clusterHeightScale: 1.8,    // for cluster view
        clusterWidthScale: 0.3,     // for cluster view
        
        nodeRadius: 4,
        labelOffset: 6,
        pathStyle: "elbow",        // smooth / elbow / straight
        
        countBarHeight: 3,         // height of count bars 
        countBarMaxWidth: 50,      // maximum width for count bars
        countBarScale: 1,          // scaling factor for count bars
        countBarExponent: 1        // exponent for non-linear mapping (1 = linear)
    },
    fontSize: {
        parent: 14,  // px are added after
        leaf: 12     // px are added after
    },
    links: {
        minWidth: 1,
        maxWidth: 40
    }
};
