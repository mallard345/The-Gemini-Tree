let modInfo = {
    name: "Cosmic Genesis", // The name of your mod
    id: "cosmic_genesis_mod", // A unique identifier for your mod. MUST BE UNIQUE!
    author: "Gemini", // You!
    pointsName: "Stardust", // The name of the primary resource
    modFiles: ["layers.js", "tree.js"], // Files your mod uses

    discordName: "", // Optional: Your discord server name
    discordLink: "", // Optional: Link to your discord server
    initialStartPoints: new Decimal (10), // Starting Stardust amount
    offlineLimit: 1, // The number of hours offline production lasts (in hours)
}

// Set things up automatically
let winText = `Congratulations! You've reached the end and become a true Cosmic Architect... for now.`; // End game message (if you add an endgame)

// Determines when the game "ends"
// Does not(!!) influence gain limits.
// Usually only useful for win screens/popups
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"] // Functions to avoid calling every tick (usually for performance)

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints) // Returns the starting points defined above
}

// Determines if it should show points generation upon starting
function canGenPoints(){
    return true; // Yes, we start generating Stardust immediately
}

// Calculate point generation
// 'player' variable holds all the save data
function getPointGen() {
    if(!canGenPoints())
        return new Decimal(0) // If canGenPoints is false, generate 0

    let gain = new Decimal(1) // Base gain: 1 Stardust per second

    // Apply gain multipliers from the 'Nebula' (n) layer, if it exists and has an effect
    if (hasUpgrade('n', 11)) gain = gain.times(upgradeEffect('n', 11)); // Example: Nebula Upgrade 1 multiplies gain
    if (player.n.points.gte(1)) gain = gain.times(layers.n.effect()); // Apply Nebula layer's main effect

    // Apply gain exponents (rarely used for base currency, but possible)
    // Example: if (hasUpgrade('p', 11)) gain = gain.pow(upgradeEffect('p', 11));

    return gain
}

// You can add non-layer related variables that should to be saved here
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
    // Example: function() { return "Current Endgame: End of Content" }
]

// Determines when the game is beaten
function isEndgame() {
    return false // We haven't defined an endgame condition yet
    // Example: return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
    return(3600) // Default is 1 hour which is fine for most things
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their points and reset their progress.
function fixOldSave(oldVersion){
}
