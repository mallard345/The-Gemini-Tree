

// Layer 0: Null Point
addLayer("n", {
    name: "Null Point", // Full name
    symbol: "N", // Displayed in layer selection
    position: 0, // Horizontal position
    startData() { return {
        unlocked: true,
		points: new Decimal(0), // Potential Energy (PE)
        total_sparks: new Decimal(0),
    }},
    color: "#606060",
    resource: "Potential Energy", // Name of prestige currency
    baseResource: "null", // Usually null for the first layer
    requires: new Decimal(0), // Can start immediately
    baseAmount() {return new Decimal(0)}, // Won't gain points passively initially
    type: "static", // Doesn't passively generate points, requires clicking/upgrades
    exponent: 0, // Base calculation factor, not really used for static
    gainMult() { // Multiplier based on upgrades
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Exponent based on upgrades
        return new Decimal(1)
    },
    row: 0, // Row in layer display
    layerShown(){return true},

    clickables: {
        11: {
            title: "Spark",
            display() { return `Generate ${format(this.effect(), 0)} Potential Energy.<br/>You have sparked ${format(player.n.total_sparks, 0)} times.` },
            canClick() { return true },
            onClick() {
                player.n.points = player.n.points.add(this.effect());
                player.n.total_sparks = player.n.total_sparks.add(1);
            },
            effect() {
                let eff = new Decimal(1);
                if (hasUpgrade('n', 11)) eff = eff.add(upgradeEffect('n', 11));
                if (hasUpgrade('n', 13)) eff = eff.mul(upgradeEffect('n', 13));
                // Add effects from other layers later if needed
                return eff;
            },
            style: {'min-height': '80px', 'width': '160px'},
        },
    },

    upgrades: {
        rows: 1,
        cols: 3,
        11: {
            title: "Refined Spark",
            description: "Add +1 base Potential Energy per Spark.",
            cost: new Decimal(5),
            effect() {
                return new Decimal(1);
            },
            unlocked() { return player.n.total_sparks.gte(1) },
        },
        12: {
            title: "Quantum Fluctuation",
            description: "Begin generating Potential Energy passively based on total Sparks.",
            cost: new Decimal(20),
            effect() {
                // Simple passive gain, can be made more complex
                let eff = player.n.total_sparks.pow(0.5).div(5).add(0.01);
                 if (hasUpgrade('n', 13)) eff = eff.mul(upgradeEffect('n', 13));
                return eff;
            },
            effectDisplay() { return `+${format(this.effect())}/s` },
            unlocked() { return hasUpgrade('n', 11) },
        },
        13: {
            title: "Potential Well",
            description: "Multiply Spark effect and passive generation based on current Potential Energy.",
            cost: new Decimal(100),
            effect() {
                // Softcap might be needed here later
                return player.n.points.add(1).log10().pow(0.8).add(1);
            },
            effectDisplay() { return `x${format(this.effect())}` },
            unlocked() { return hasUpgrade('n', 12) },
        },
    },

    // Basic passive generation based on upgrade 12
    update(diff) {
        if (hasUpgrade('n', 12)) {
            player.n.points = player.n.points.add(upgradeEffect('n', 12).times(diff));
        }
    },

    // Prestige mechanic to unlock Layer 1 (Quantum Foam)
    canReset() { return player.n.points.gte(1000) }, // Example requirement
    getNextAt() { return new Decimal(1000) }, // Show requirement
    prestigeButtonText() { return `Collapse the Null Point to generate <br/><h2>${format(this.getResetGain(), 0)}</h2> Fluctuation Points (FP)`},
    getResetGain() {
        // Simple prestige gain formula, needs balancing
        let gain = player.n.points.div(100).pow(0.5);
        // Add multipliers from other layers/upgrades later
        return gain.floor();
    },
    onPrestige(gain) {
        player.qf.points = player.qf.points.add(gain); // Add gain to the next layer's points
        // Optionally gain permanent boosts based on FP?
    },

    // Hotkeys, Milestones, Challenges etc. can be added here
});


// Layer 1: Quantum Foam
addLayer("qf", {
    name: "Quantum Foam",
    symbol: "QF",
    position: 0,
    startData() { return {
        unlocked: false, // Start locked
		points: new Decimal(0), // Fluctuation Points (FP) - gained from N prestige
        virtual_particles: new Decimal(0), // Virtual Particles (VP) - main resource here
    }},
    color: "#A0A0FF",
    resource: "Fluctuation Points (FP)", // Currency gained from previous layer
    baseResource: "Potential Energy", // Layer that provides FP
    requires: new Decimal(1000), // Requirement from Layer N (points)
    baseAmount() {return player.n.points},
    type: "normal", // Gains points on prestige based on formula below
    exponent: 0.5, // Prestige formula component: (baseAmount / requires) ^ exponent
    gainMult() {
        let mult = new Decimal(1)
        // Add multipliers later
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1, // Vertical position
    layerShown(){return player.n.points.gte(500) || player.qf.unlocked || player.hp.unlocked }, // Show when N gets close or QF/HP unlocked

    // --- Layer 1 Specific Mechanics ---
    infoboxes: {
        lore: {
            title: "The Foam",
            body() { return "The initial energy fluctuations coalesce into a sea of fleeting Virtual Particles (VP). They decay rapidly unless stabilized. Use FP to bootstrap VP generation and stabilization."; },
        },
        mechanics: {
            title: "Virtual Particles (VP)",
             body() { return `You are generating ${format(tmp.qf.vpGainRate)} VP/sec.<br/>VP decays at a rate influenced by Stabilizers.<br/>Current VP: ${format(player.qf.virtual_particles)}`; },
        }
    },

    vpGainRate() { // Base VP gain, influenced by FP
        let gain = player.qf.points.pow(0.8).add(1);
        if (hasUpgrade('qf', 11)) gain = gain.mul(upgradeEffect('qf', 11));
        if (hasUpgrade('qf', 13)) gain = gain.mul(upgradeEffect('qf', 13));
        // Add buyable effects etc.
        gain = gain.mul(buyableEffect('qf', 12)); // Exciters effect
        return gain;
    },

    vpDecayRate() { // How fast VP decays
        let decay = new Decimal(0.5); // Base decay factor (e.g., 50% per second)
        // Stabilizers reduce decay
        decay = decay.div(buyableEffect('qf', 11).add(1)); // Add 1 to avoid division by zero
        if (decay.lt(0.01)) decay = new Decimal(0.01); // Minimum decay rate
        return decay;
    },

    update(diff) {
        // Generate VP
        player.qf.virtual_particles = player.qf.virtual_particles.add(tmp.qf.vpGainRate.times(diff));

        // Decay VP - Simplified decay model: lose (decay rate * current VP * diff)
        // A more accurate model might use (current VP * (1 - decayRate)^diff)
        let decayFactor = tmp.qf.vpDecayRate.times(diff);
        if (decayFactor.gt(1)) decayFactor = new Decimal(1); // Cannot decay more than 100%
        player.qf.virtual_particles = player.qf.virtual_particles.mul(Decimal.sub(1, decayFactor));

        if (player.qf.virtual_particles.lt(0)) player.qf.virtual_particles = new Decimal(0); // Floor at 0
    },

    buyables: {
        rows: 1,
        cols: 2,
        11: { // Stabilizers
            title: "Stabilizers",
            cost(x) { return new Decimal(10).mul(Decimal.pow(1.5, x)) }, // Cost in VP
            display() { return `Reduce VP decay rate.<br/>Level: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br/>Effect: /${format(this.effect())}<br/>Cost: ${format(this.cost())} VP` },
            canAfford() { return player.qf.virtual_particles.gte(this.cost()) },
            buy() {
                player.qf.virtual_particles = player.qf.virtual_particles.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let eff = Decimal.pow(1.3, x); // Multiplicative reduction factor
                // Add upgrade boosts later
                return eff;
            },
            purchaseLimit: new Decimal(50), // Example hardcap
            style: {'min-height': '100px', 'width': '140px'},
        },
        12: { // Exciters
            title: "Exciters",
            cost(x) { return new Decimal(5).mul(Decimal.pow(1.8, x)) }, // Cost in FP
            display() { return `Boost base VP generation rate.<br/>Level: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br/>Effect: x${format(this.effect())}<br/>Cost: ${format(this.cost())} FP` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let eff = Decimal.pow(1.5, x); // Multiplicative boost
                 if (hasUpgrade('qf', 12)) eff = eff.pow(1.2); // Example upgrade interaction
                return eff;
            },
             purchaseLimit: new Decimal(50), // Example hardcap
            style: {'min-height': '100px', 'width': '140px'},
        }
    },

    upgrades: {
        rows: 1,
        cols: 3,
         11: {
            title: "Persistent Fluctuations",
            description: "Boost base VP generation based on total FP gained on resets.",
            cost: new Decimal(5), // Cost in FP
            currencyLocation() { return player[this.layer] }, // Where to deduct cost from
            currencyInternalName: "points",
            currencyDisplayName: "FP",
            effect() {
                return player.qf.total.add(1).pow(0.3); // Example effect using total FP
            },
            effectDisplay() { return `x${format(this.effect())}` },
            unlocked() { return player.qf.unlocked },
        },
        12: {
            title: "Exciter Synergy",
            description: "Exciters are ^1.2 more effective.",
            cost: new Decimal(500), // Cost in VP
            currencyLocation() { return player.qf },
            currencyInternalName: "virtual_particles",
            currencyDisplayName: "VP",
             unlocked() { return getBuyableAmount('qf', 12).gte(5) },
        },
        13: {
            title: "VP Resonance",
            description: "VP generation is multiplied based on current VP (softcapped).",
            cost: new Decimal(50), // Cost in FP
            currencyLocation() { return player[this.layer] },
            currencyInternalName: "points",
            currencyDisplayName: "FP",
            effect() {
                // Example softcap: log10
                return player.qf.virtual_particles.add(1).log10().pow(0.7).add(1);
            },
            effectDisplay() { return `x${format(this.effect())}` },
            unlocked() { return hasUpgrade('qf', 11) },
        },
    },

    // Prestige mechanic to unlock Layer 2 (Hadron Synthesis)
    requires: () => new Decimal(1e6), // Requires 1 Million VP (example)
    baseResource: "virtual particles",
    baseAmount() { return player.qf.virtual_particles },
    prestigeButtonText() { return `Condense the Foam to generate <br/><h2>${format(tmp.qf.resetGain, 0)}</h2> Quark Plasma (QP)`},
    type: "normal", // Gains QP on reset
    exponent: 0.3, // Needs balancing
    gainMult() {
        let mult = new Decimal(1);
        // Add multipliers later
        return mult;
    },
    onPrestige(gain) {
         player.hp.points = player.hp.points.add(gain);
    },

    // TODO: Add Milestones (e.g., auto-buyables), Challenges
});


// Layer 2: Hadron Synthesis
addLayer("hp", {
    name: "Hadron Synthesis",
    symbol: "HP",
    position: 1, // To the right of QF
    startData() { return {
        unlocked: false,
		points: new Decimal(0), // Quark Plasma (QP) - gained from QF prestige
        quarks: new Decimal(0), // Basic Quark resource
        gluons: new Decimal(0), // Binding resource
        hadrons: new Decimal(0), // Protons/Neutrons combined resource
    }},
    color: "#FF8080",
    resource: "Quark Plasma (QP)",
    baseResource: "Virtual Particles (VP)",
    requires: new Decimal(1e6), // VP requirement from QF
    baseAmount() {return player.qf.virtual_particles},
    type: "normal",
    exponent: 0.3, // Needs balancing
    gainMult() {
        let mult = new Decimal(1)
        // Add multipliers later
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1,
    layerShown(){ return player.qf.virtual_particles.gte(1e5) || player.hp.unlocked }, // Show when QF gets close or HP unlocked

    // --- Layer 2 Specific Mechanics ---
    infoboxes: {
        lore: {
            title: "Primordial Soup",
            body() { return "Quark Plasma allows the formation of fundamental Quarks. These must bind together using Gluons to form stable Hadrons (Protons/Neutrons)."; },
        },
        mechanics: {
             title: "Hadron Formation",
             body() { return `Use QP to generate Quarks. Quarks automatically generate Gluons. Hadrons are formed from Quarks and Gluons.<br/>Quarks: ${format(player.hp.quarks)}<br/>Gluons: ${format(player.hp.gluons)}<br/>Hadrons: ${format(player.hp.hadrons)}`; },
        }
    },

    quarkGainRate() {
        let gain = player.hp.points.pow(0.6).add(1); // Generate Quarks based on QP
        if (hasUpgrade('hp', 11)) gain = gain.mul(upgradeEffect('hp', 11));
        // TODO: Add buyable/other boosts
        return gain;
    },

    gluonGainRate() {
        let gain = player.hp.quarks.pow(0.4).div(2).add(0.1); // Generate Gluons based on Quarks
        if (hasUpgrade('hp', 12)) gain = gain.mul(upgradeEffect('hp', 12));
        // TODO: Add buyable/other boosts
        return gain;
    },

    hadronFormationRate() {
        // Formation depends on both Quarks and Gluons, needs balancing
        // Simplistic model: Min(Quarks, Gluons * 3) ^ 0.5
        let potential = player.hp.quarks.min(player.hp.gluons.mul(3)); // Need ~3 quarks per hadron, limited by gluon binding
        let rate = potential.pow(0.5).div(10); // Needs heavy balancing
        if (hasUpgrade('hp', 13)) rate = rate.mul(upgradeEffect('hp', 13));
        // TODO: Add buyable/other boosts
        return rate;
    },

    update(diff) {
        // Generate Quarks
        player.hp.quarks = player.hp.quarks.add(tmp.hp.quarkGainRate.times(diff));
        // Generate Gluons
        player.hp.gluons = player.hp.gluons.add(tmp.hp.gluonGainRate.times(diff));

        // Form Hadrons & Consume Resources
        let formedHadrons = tmp.hp.hadronFormationRate.times(diff);
        // Limit formation by available resources
        let maxFromQuarks = player.hp.quarks.div(3).times(diff); // Assuming 3 quarks per hadron
        let maxFromGluons = player.hp.gluons.div(1).times(diff); // Assuming 1 effective gluon interaction per hadron formed
        formedHadrons = formedHadrons.min(maxFromQuarks).min(maxFromGluons);

        if (formedHadrons.gt(0)) {
            player.hp.hadrons = player.hp.hadrons.add(formedHadrons);
            player.hp.quarks = player.hp.quarks.sub(formedHadrons.mul(3)); // Consume 3 quarks
            player.hp.gluons = player.hp.gluons.sub(formedHadrons.mul(1)); // Consume 1 gluon unit
        }

        // Ensure resources don't go negative
        if (player.hp.quarks.lt(0)) player.hp.quarks = new Decimal(0);
        if (player.hp.gluons.lt(0)) player.hp.gluons = new Decimal(0);
    },

     upgrades: {
        rows: 1,
        cols: 3,
         11: {
            title: "Quark Excitation",
            description: "Boost base Quark generation based on total QP gained.",
            cost: new Decimal(5), // Cost in QP
            currencyLocation() { return player.hp },
            currencyInternalName: "points",
            currencyDisplayName: "QP",
            effect() {
                return player.hp.total.add(1).pow(0.4);
            },
            effectDisplay() { return `x${format(this.effect())}` },
            unlocked() { return player.hp.unlocked },
        },
        12: {
            title: "Stronger Fields",
            description: "Boost base Gluon generation based on Hadrons formed.",
            cost: new Decimal(100), // Cost in Quarks
            currencyLocation() { return player.hp },
            currencyInternalName: "quarks",
            currencyDisplayName: "Quarks",
            effect() {
                return player.hp.hadrons.add(1).pow(0.25);
            },
            effectDisplay() { return `x${format(this.effect())}` },
            unlocked() { return player.hp.hadrons.gte(10) },
        },
        13: {
            title: "Hadron Resonance",
            description: "Boost Hadron formation rate based on QP.",
            cost: new Decimal(50), // Cost in QP
            currencyLocation() { return player.hp },
            currencyInternalName: "points",
            currencyDisplayName: "QP",
            effect() {
                return player.hp.points.add(1).log10().pow(1.1).add(1);
            },
            effectDisplay() { return `x${format(this.effect())}` },
             unlocked() { return hasUpgrade('hp', 11) },
        },
    },

    // TODO: Add Buyables (e.g., improve quark generation, gluon efficiency, hadron stability)
    // TODO: Add Challenges (e.g., form Hadrons with fluctuating quark types, limited gluons)
    // TODO: Add Milestones (e.g., automate something?)

    // Prestige mechanic to unlock Layer 3 (Nucleus Formation)
    requires: () => new Decimal(1000), // Requires 1k Hadrons (example)
    baseResource: "hadrons",
    baseAmount() { return player.hp.hadrons },
    prestigeButtonText() { return `Stabilize Hadronic Matter to generate <br/><h2>${format(tmp.hp.resetGain, 0)}</h2> Nucleonic Force (NF)`},
    type: "normal", // Gains NF on reset
    exponent: 0.4, // Needs balancing
    gainMult() {
        let mult = new Decimal(1);
        // Add multipliers later
        return mult;
    },
    // onPrestige(gain) { // Add to next layer when created
    //      player.nf.points = player.nf.points.add(gain);
    // },

});

/
