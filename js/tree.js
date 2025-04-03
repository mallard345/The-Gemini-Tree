var layoutInfo = {
    startTab: "none", // Which tab loads first (none = default main tab)
    showTree: true, // Show the layer tree visually

    treeLayout: "" // By default, layers arrange themselves. You can customize heavily here if needed.
}

// Define the tree structure
// Each array represents a row, containing the layer symbols
var treeStyle = { // Styling for the tree lines
    stroke: "#ffffff", // White lines
    "stroke-width": 2,
}
var P = ["n"] // Prestige button on layer 'n'

// This simple layout puts the Nebula layer ('n') below the main Stardust area.
// If you add more layers, add their symbols here in the desired rows.
// Example: tree = [ ["s"], ["n", "g"], ["q"] ] for Stardust, Nebulas/Galaxies, Quasars
var tree = [
    ["n"] // Put Nebula layer 'n' in the first row of the tree display (row index 0 internally, but visually below the main points)
]

// Optional: Define relationships for drawing lines if the automatic layout isn't enough
// var layout = {
//     "n": {
//         prestigeNotify() {return true} // Example: Always show notification for Nebula prestige
//     }
// }

// Function to determine which layer tab is currently selected
var defaultInfo = { // Default information for layers if not specified elsewhere
    // ... (default TMT values)
}
