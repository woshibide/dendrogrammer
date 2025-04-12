import { debugMode, pathToCSV } from '../config/default-config.js';

// debug helper
function debug(...args) {
    if (debugMode) console.log('>>>', ...args);
}

// export the svg visualization 
export function exportSVG() {
    debug('Starting SVG export');
    const svgNode = document.querySelector("#chart svg");
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgNode);

    // add namespaces if missing
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    
    // convert to uri
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    // create and trigger download
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${pathToCSV.slice(0, -4)}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    debug('SVG exported:', downloadLink.download);
}