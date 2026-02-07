
const debug = true;

const container = {
    TABLE_VARIABLE: document.getElementById("tableVariableContainer"),
	WEREFORM: document.getElementById("wereformContainer"),
	PRIMARY_WEAPON: document.getElementById("primaryWeaponContainer"),
	IS_ONE_HANDED: document.getElementById("isOneHandedContainer"),
	PRIMARY_WEAPON_IAS: document.getElementById("primaryWeaponIASContainer"),
	SECONDARY_WEAPON: document.getElementById("secondaryWeaponContainer"),
	SECONDARY_WEAPON_IAS: document.getElementById("secondaryWeaponIASContainer"),
	IAS: document.getElementById("IASContainer"),
	FANATICISM: document.getElementById("fanaticismContainer"),
	BURST_OF_SPEED: document.getElementById("burstOfSpeedContainer"),
	WEREWOLF: document.getElementById("werewolfContainer"),
	MAUL: document.getElementById("maulContainer"),
	FRENZY: document.getElementById("frenzyContainer"),
	MARK_OF_BEAR: document.getElementById("markOfBearContainer"),
	HOLY_FREEZE: document.getElementById("holyFreezeContainer"),
	SLOWED_BY: document.getElementById("slowedByContainer"),
	DECREPIFY: document.getElementById("decrepifyContainer"),
	CHILLED: document.getElementById("chilledContainer"),
	TABLE: document.getElementById("tableContainer")
};

const select = {
    TABLE_VARIABLE: document.getElementById("tableVariableSelect"),
	CHARACTER: document.getElementById("characterSelect"),
	WEREFORM: document.getElementById("wereformSelect"),
	SKILL: document.getElementById("skillSelect"),
	PRIMARY_WEAPON: document.getElementById("primaryWeaponSelect"),
	SECONDARY_WEAPON: document.getElementById("secondaryWeaponSelect")
};

const number = {
    PRIMARY_WEAPON_IAS: document.getElementById("primaryWeaponIAS"),
	SECONDARY_WEAPON_IAS: document.getElementById("secondaryWeaponIAS"),
	IAS: document.getElementById("IAS"),
	FANATICISM: document.getElementById("fanaticismLevel"),
	BURST_OF_SPEED: document.getElementById("burstOfSpeedLevel"),
	WEREWOLF: document.getElementById("werewolfLevel"),
	MAUL: document.getElementById("maulLevel"),
	FRENZY: document.getElementById("frenzyLevel"),
	HOLY_FREEZE: document.getElementById("holyFreezeLevel"),
	SLOWED_BY: document.getElementById("slowedByLevel")
};

const checkbox = {
    IS_ONE_HANDED: document.getElementById("isOneHanded"),
	MARK_OF_BEAR: document.getElementById("markOfBear"),
	DECREPIFY: document.getElementById("decrepify"),
	CHILLED: document.getElementById("chilled")
};

const char = {
    AMAZON: 0,
    ASSASSIN: 1,
    BARBARIAN: 2,
    DRUID: 3,
    NECROMANCER: 4,
    PALADIN: 5,
    SORCERESS: 6,
	// mercs
    ROGUE_SCOUT: 7,
    DESERT_MERCENARY: 8,
    BASH_BARBARIAN: 9,
    FRENZY_BARBARIAN: 10
};

const wf = {
    HUMAN: 0,
    WEREBEAR: 1,
    WEREWOLF: 2
};

const tv = {
	EIAS: 0,
    IAS: 1,
    FANATICISM: 2,
    PRIMARY_WEAPON_IAS: 3,
    SECONDARY_WEAPON_IAS: 4,
    BURST_OF_SPEED: 5,
    WEREWOLF: 6,
    FRENZY: 7,
    MAUL: 8
};

export function isTableVariableSkill(variable) {
	return variable == tv.FANATICISM || variable == tv.BURST_OF_SPEED || variable == tv.WEREWOLF
		|| variable == tv.MAUL || variable == tv.FRENZY;
}

export function getTableVariableSkill(variable) {
	switch(variable) {
		case tv.FANATICISM:
			return skill.FANATICISM;
		case tv.BURST_OF_SPEED:
			return skill.BURST_OF_SPEED;
		case tv.WEREWOLF:
			return skill.WEREWOLF;
		case tv.MAUL:
			return skill.MAUL;
		case tv.FRENZY:
			return skill.FRENZY;
		default:
			return null;
	}
}

const option = {
	TABLE_VARIABLE_IAS: select.TABLE_VARIABLE.options[tv.IAS],
    TABLE_VARIABLE_PRIMARY_WEAPON_IAS: select.TABLE_VARIABLE.options[tv.PRIMARY_WEAPON_IAS],
	TABLE_VARIABLE_SECONDARY_WEAPON_IAS: select.TABLE_VARIABLE.options[tv.SECONDARY_WEAPON_IAS],
	TABLE_VARIABLE_BURST_OF_SPEED: select.TABLE_VARIABLE.options[tv.BURST_OF_SPEED],
	TABLE_VARIABLE_WEREWOLF: select.TABLE_VARIABLE.options[tv.WEREWOLF],
	TABLE_VARIABLE_FRENZY: select.TABLE_VARIABLE.options[tv.FRENZY],
	TABLE_VARIABLE_MAUL: select.TABLE_VARIABLE.options[tv.MAUL],

	WEREFORM_WEREWOLF: select.WEREFORM.options[wf.WEREWOLF]
};

const button = {
    GENERATE_LINK: document.getElementById("generateLink")
};

const other = {

	MAX_EIAS: 75, // for a brief period of D2R, this limit did not exist. rip bugged ias frames :(
	MIN_EIAS: -85,	
	MAX_EIAS_WEREFORMS: 150,
	MAX_IAS_ACCELERATION_WEAPON: 60,
	MAX_IAS_ACCELERATION_CHARACTER: 88,
	MAX_IAS_ACCELERATION_CHARACTER_TWO_HANDED: 83,
	MAX_IAS_ACCELERATION_MERCENARY: 78,
	MAX_IAS_WEAPON: 120

};

const LINK_SEPARATOR = '-';

export class DataParser {

	constructor(data) {
		this.data = [...data];
		this.index = 0;
	}

	readToken() {
		let string = "";
		while (this.index < this.data.length && this.data[this.index] != LINK_SEPARATOR) {
			string += this.data[this.index++];
		}
		this.index++;
		return string;
	}

	readInt() {
		return parseInt(this.readToken());
	}

	readBoolean() {
		return !!this.readInt();
	}

	readString() {
		return this.readToken();
	}

	isLetter(c) {
		return c.toLowerCase() != c.toUpperCase();
	}

}

class WeaponType {

	constructor(isMelee, isOneHand, frameData) {
		this.isMelee = isMelee;
		this.isOneHand = isOneHand;
		this.frameData = new Map(frameData);
	}

	getFramesPerDirection(character) {
		let value = this.frameData.get(character);
		return Array.isArray(value) ? value[0] : value;
	}

	hasAlternateAnimation(character) {
		let characterFrameData = this.frameData.get(character);
		return Array.isArray(characterFrameData) && characterFrameData.length == 3;
	}

	getAlternateFramesPerDirection(character) {
		return this.frameData.get(character)[1];
	}

	getActionFrame(character) {
		let characterFrameData = this.frameData.get(character);
		return characterFrameData[characterFrameData.length - 1];
	}

}

class Weapon {

	constructor(name, WSM, type, itemClass, maxSockets) {
		this.name = name;
		this.WSM = WSM;
		this.type = type;
		this.itemClass = itemClass;
		this.maxSockets = maxSockets;
	}

	canBeThrown() {
		return this.itemClass == ic.THROWING || this.itemClass == ic.JAVELIN;
	}

}

class Skill {

	constructor(name, canDualWield, isDualWieldOnly, isSequence, isRollback) {
		this.name = name;
		this.canDualWield = canDualWield;
		this.isDualWieldOnly = isDualWieldOnly;
		this.isSequence = isSequence;
		this.isRollback = isRollback;
	}

	isDualWieldedSequenceSkill() {
		return this.isDualWieldOnly && this.isSequence;
	}

}

class AttackSpeedSkill {

	constructor(input, min, factor, max, tableVariable, predicate) {
		this.input = input;
		this.min = min;
		this.factor = factor;
		this.max = max;
		this.tableVariable = tableVariable;
		this.predicate = predicate;
		this.reverse = new Map();
		for (let level = 60; level >= 0; level--) {
			this.reverse.set(this.getEIASFromLevel(level), level);
		}
	}

	calculate(tableVariable, character, wereform) {
		if (this.tableVariable == tableVariable || (this.predicate != null && !this.predicate(character, wereform))) return 0;
		let level = parseInt(this.input.value);
		if (this.min == -1) return level == 0 ? 0 : this.factor * (parseInt(level / 2) + 3); 
		return level == 0 ? 0 : Math.min(this.min + parseInt(this.factor * parseInt((110 * level) / (level + 6)) / 100), this.max);
	}

	getEIASFromLevel(level) {
		if (this.min == -1) return level == 0 ? 0 : this.factor * (parseInt(level / 2) + 3); // hardcoded specifically for maul
		if (level == 0) return 0;
		return Math.min(this.min + parseInt(this.factor * parseInt((110 * level) / (level + 6)) / 100), this.max);
	}

	getLevelFromEIAS(EIAS) { // this probably doesn't work for holy freeze, but the interface never uses this with holy freeze
		let lastLevel = 60;
		for (const [levelEIAS, level] of this.reverse) {
			if (EIAS > levelEIAS) return lastLevel;
			lastLevel = level;
		}
		return 0;
	}

}

const skill = {
    FANATICISM: new AttackSpeedSkill(number.FANATICISM, 10, 30, 40, tv.FANATICISM),
	BURST_OF_SPEED: new AttackSpeedSkill(number.BURST_OF_SPEED, 15, 45, 60, tv.BURST_OF_SPEED/*, (character, _wereform) => character == char.ASSASSIN*/),
	WEREWOLF: new AttackSpeedSkill(number.WEREWOLF, 10, 70, 80, tv.WEREWOLF, (_character, wereform) => wereform == wf.WEREWOLF),
	MAUL: new AttackSpeedSkill(number.MAUL, -1, 3, 99, tv.MAUL, (_character, wereform) => wereform == wf.WEREBEAR),
	FRENZY: new AttackSpeedSkill(number.FRENZY, 0, 50, 50, tv.FRENZY, (character, _wereform) => character == char.BARBARIAN || character == char.BASH_BARBARIAN),
	HOLY_FREEZE: new AttackSpeedSkill(number.HOLY_FREEZE, 25, 35, 50) // -50 cap cuz chill effectiveness
};

const skillsMap = new Map();
const skills = {
    // common
    STANDARD: addSkill(new Skill("Standard", true, false, false, false)), // offhand hits have different speed in normal attack
    THROW: addSkill(new Skill("Throw", false, false, false, false)),
    KICK: addSkill(new Skill("Kick", false, false, false, false)), // kicking barrels open
    // amazon
    DODGE: addSkill(new Skill("Dodge", false, false, false, false)),
    IMPALE: addSkill(new Skill("Impale", false, false, true, false)),
    JAB: addSkill(new Skill("Jab", false, false, true, false)),
    STRAFE: addSkill(new Skill("Strafe", false, false, false, true)),
    FEND: addSkill(new Skill("Fend", false, false, false, true)),
    // assassin
    TIGER_STRIKE: addSkill(new Skill("Tiger Strike", false, false, false, false)),
    COBRA_STRIKE: addSkill(new Skill("Cobra Strike", false, false, false, false)),
    PHOENIX_STRIKE: addSkill(new Skill("Phoenix Strike", false, false, false, false)),
    FISTS_OF_FIRE: addSkill(new Skill("Fists of Fire", true, false, true, false)),
    CLAWS_OF_THUNDER: addSkill(new Skill("Claws of Thunder", true, false, true, false)),
    BLADES_OF_ICE: addSkill(new Skill("Blades of Ice", true, false, true, false)),
    DRAGON_CLAW: addSkill(new Skill("Dragon Claw", true, true, false)),
    DRAGON_TAIL: addSkill(new Skill("Dragon Tail", false, false, false)),
    DRAGON_TALON: addSkill(new Skill("Dragon Talon", false, false, true)),
    LAYING_TRAPS: addSkill(new Skill("Laying Traps", false, false, false)),
    // barbarian
    DOUBLE_SWING: addSkill(new Skill("Double Swing", true, true, true, false)),
    FRENZY: addSkill(new Skill("Frenzy", true, true, true, false)),
    TAUNT: addSkill(new Skill("Taunt", true, false, false)), // frenzy merc
    DOUBLE_THROW: addSkill(new Skill("Double Throw", true, true, true, false)),
    WHIRLWIND: addSkill(new Skill("Whirlwind", true, false, false, false)), // whirlwind is technically a sequence skill, but its very hardcoded, so it doesnt follow the same logic for calculation
    CONCENTRATE: addSkill(new Skill("Concentrate", false, false, false, false)),
    BERSERK: addSkill(new Skill("Berserk", false, false, false, false)),
    BASH: addSkill(new Skill("Bash", false, false, false, false)),
    STUN: addSkill(new Skill("Stun", false, false, false, false)),
    // druid
    FERAL_RAGE: addSkill(new Skill("Feral Rage", false, false, false, false)), // barb can dual wield but it doesn't impact the skill since its primary-only
    HUNGER: addSkill(new Skill("Hunger", false, false, false, false)),
    RABIES: addSkill(new Skill("Rabies", false, false, false, false)),
    FURY: addSkill(new Skill("Fury", false, false, false, false)),
    // paladin
    ZEAL: addSkill(new Skill("Zeal", false, false, false, true)),
    SMITE: addSkill(new Skill("Smite", false, false, false, false)),
    SACRIFICE: addSkill(new Skill("Sacrifice", false, false, false, false)),
    VENGEANCE: addSkill(new Skill("Vengeance", false, false, false, false)),
    CONVERSION: addSkill(new Skill("Conversion", false, false, false, false))
};

function addSkill(skill) { skillsMap.set(skill.name, skill); return skill; }

export function getSkill(name) {
    return skillsMap.get(name);
}

const wt = { // weapon types
    UNARMED: new WeaponType(true, true, [
        [char.AMAZON, [13, 8]],
        [char.ASSASSIN, [11, 12, 6]],
        [char.BARBARIAN, [12, 6]],
        [char.DRUID, [16, 8]],
        [char.NECROMANCER, [15, 8]],
        [char.PALADIN, [14, 7]],
        [char.SORCERESS, [16, 9]],
        [char.ROGUE_SCOUT, 15], // assumed
        [char.DESERT_MERCENARY, 16], // assumed
        [char.BASH_BARBARIAN, 16],  // assumed
        [char.FRENZY_BARBARIAN, 16]  // assumed
    ]),
    CLAW: new WeaponType(true, true, [[char.ASSASSIN, [11, 12, 6]]]),
    ONE_HANDED_SWINGING: new WeaponType(true, true, [
        [char.AMAZON, [16, 10]],
        [char.ASSASSIN, [15, 7]],
        [char.BARBARIAN, [16, 7]],
        [char.DRUID, [19, 9]],
        [char.NECROMANCER, [19, 9]],
        [char.PALADIN, [15, 7]],
        [char.SORCERESS, [20, 12]],
        [char.BASH_BARBARIAN, 16],
        [char.FRENZY_BARBARIAN, 16]
    ]),
    ONE_HANDED_THRUSTING: new WeaponType(true, true, [
        [char.AMAZON, [15, 9]],
        [char.ASSASSIN, [15, 7]],
        [char.BARBARIAN, [16, 7]],
        [char.DRUID, [19, 8]],
        [char.NECROMANCER, [19, 9]],
        [char.PALADIN, [17, 8]],
        [char.SORCERESS, [19, 11]],
        [char.DESERT_MERCENARY, 16]
    ]),
    TWO_HANDED_SWORD: new WeaponType(true, false, [
        [char.AMAZON, [20, 12]],
        [char.ASSASSIN, [23, 11]],
        [char.BARBARIAN, [18, 8]],
        [char.DRUID, [21, 10]],
        [char.NECROMANCER, [23, 11]],
        [char.PALADIN, [18, 19, 8]],
        [char.SORCERESS, [24, 14]],
        [char.BASH_BARBARIAN, 16],
        [char.FRENZY_BARBARIAN, 16]
    ]),
    TWO_HANDED_THRUSTING: new WeaponType(true, false, [
        [char.AMAZON, [18, 11]],
        [char.ASSASSIN, [23, 10]],
        [char.BARBARIAN, [19, 9]],
        [char.DRUID, [23, 9]],
        [char.NECROMANCER, [24, 10]],
        [char.PALADIN, [20, 8]],
        [char.SORCERESS, [23, 13]],
        [char.DESERT_MERCENARY, 16]
    ]),
    // all other two handed weapons
    TWO_HANDED: new WeaponType(true, false, [ // original calc suggests this is STF while two handed sword is 2HS
        [char.AMAZON, [20, 12]],
        [char.ASSASSIN, [19, 9]],
        [char.BARBARIAN, [19, 9]],
        [char.DRUID, [17, 9]],
        [char.NECROMANCER, [20, 11]],
        [char.PALADIN, [18, 9]],
        [char.SORCERESS, [18, 11]],
        [char.DESERT_MERCENARY, 16]
    ]),
    BOW: new WeaponType(false, false, [
        [char.AMAZON, [14, 6]],
        [char.ASSASSIN, [16, 7]],
        [char.BARBARIAN, [15, 7]],
        [char.DRUID, [16, 8]],
        [char.NECROMANCER, [18, 9]],
        [char.PALADIN, [16, 8]],
        [char.SORCERESS, [17, 9]],
        [char.ROGUE_SCOUT, 15]
    ]),
    CROSSBOW: new WeaponType(false, false, [
        [char.AMAZON, [20, 9]],
        [char.ASSASSIN, [21, 10]],
        [char.BARBARIAN, [20, 10]],
        [char.DRUID, [20, 10]],
        [char.NECROMANCER, [20, 11]],
        [char.PALADIN, [20, 10]],
        [char.SORCERESS, [20, 11]]
    ]),
    THROWING: new WeaponType(true, true, [
        [char.AMAZON, 16],
        [char.ASSASSIN, 16],
        [char.BARBARIAN, 16],
        [char.DRUID, 18],
        [char.NECROMANCER, 20],
        [char.PALADIN, 16],
        [char.SORCERESS, 20]
    ])
};

const ic = {
	NONE: "None",
	AXE: "Axe",
	DAGGER: "Dagger",
	POLEARM: "Polearm",
	JAVELIN: "Javelin",
	SPEAR: "Spear",
	SWORD: "Sword",
	MACE: "Mace",
	MISSILE: "Missile",
	STAFF: "Staff",
	ORB: "Orb",
	CLAW: "Claw",
	THROWING: "Throwing"
};

const weaponsMap = new Map([
	["None", new Weapon("None", 0, wt.UNARMED, ic.NONE, 0)],
	["Ancient Axe", new Weapon("Ancient Axe", 10, wt.TWO_HANDED, ic.AXE, 6)],
	["Ancient Sword", new Weapon("Ancient Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 3)],
	["Arbalest", new Weapon("Arbalest", -10, wt.CROSSBOW, ic.MISSILE, 3)],
	["Archon Staff", new Weapon("Archon Staff", 10, wt.TWO_HANDED, ic.STAFF, 6)],
	["Ashwood Bow", new Weapon("Ashwood Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Ataghan", new Weapon("Ataghan", -20, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Axe", new Weapon("Axe", 10, wt.ONE_HANDED_SWINGING, ic.AXE, 4)],
	["Balanced Axe", new Weapon("Balanced Axe", -10, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Balanced Knife", new Weapon("Balanced Knife", -20, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Ballista", new Weapon("Ballista", 10, wt.CROSSBOW, ic.MISSILE, 6)],
	["Balrog Blade", new Weapon("Balrog Blade", 0, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Balrog Spear", new Weapon("Balrog Spear", 10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Barbed Club", new Weapon("Barbed Club", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Bardiche", new Weapon("Bardiche", 10, wt.TWO_HANDED, ic.POLEARM, 3)],
	["Bastard Sword", new Weapon("Bastard Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Battle Axe", new Weapon("Battle Axe", 10, wt.TWO_HANDED, ic.AXE, 5)],
	["Battle Cestus", new Weapon("Battle Cestus", -10, wt.CLAW, ic.CLAW, 2)],
	["Battle Dart", new Weapon("Battle Dart", 0, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Battle Hammer", new Weapon("Battle Hammer", 20, wt.ONE_HANDED_SWINGING, ic.MACE, 4)],
	["Battle Scythe", new Weapon("Battle Scythe", -10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Battle Staff", new Weapon("Battle Staff", 0, wt.TWO_HANDED, ic.STAFF, 4)],
	["Battle Sword", new Weapon("Battle Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Bearded Axe", new Weapon("Bearded Axe", 0, wt.TWO_HANDED, ic.AXE, 5)],
	["Bec-de-Corbin", new Weapon("Bec-de-Corbin", 0, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Berserker Axe", new Weapon("Berserker Axe", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["Bill", new Weapon("Bill", 0, wt.TWO_HANDED, ic.POLEARM, 4)],
	["Blade Bow", new Weapon("Blade Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Blade Talons", new Weapon("Blade Talons", -20, wt.CLAW, ic.CLAW, 3)],
	["Blade", new Weapon("Blade", -10, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 2)],
	["Bone Knife", new Weapon("Bone Knife", -20, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Bone Wand", new Weapon("Bone Wand", -20, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Brandistock", new Weapon("Brandistock", -20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 5)],
	["Broad Axe", new Weapon("Broad Axe", 0, wt.TWO_HANDED, ic.AXE, 5)],
	["Broad Sword", new Weapon("Broad Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Burnt Wand", new Weapon("Burnt Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 1)],
	["Caduceus", new Weapon("Caduceus", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Cedar Bow", new Weapon("Cedar Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Cedar Staff", new Weapon("Cedar Staff", 10, wt.TWO_HANDED, ic.STAFF, 4)],
	["Ceremonial Bow", new Weapon("Ceremonial Bow", 10, wt.BOW, ic.MISSILE, 5)],
	["Ceremonial Javelin", new Weapon("Ceremonial Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Ceremonial Pike", new Weapon("Ceremonial Pike", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Ceremonial Spear", new Weapon("Ceremonial Spear", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Cestus", new Weapon("Cestus", 0, wt.CLAW, ic.CLAW, 2)],
	["Champion Axe", new Weapon("Champion Axe", -10, wt.TWO_HANDED, ic.AXE, 6)],
	["Champion Sword", new Weapon("Champion Sword", -10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Chu-Ko-Nu", new Weapon("Chu-Ko-Nu", -60, wt.CROSSBOW, ic.MISSILE, 5)],
	["Cinquedeas", new Weapon("Cinquedeas", -20, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 3)],
	["Clasped Orb", new Weapon("Clasped Orb", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Claws", new Weapon("Claws", -10, wt.CLAW, ic.CLAW, 3)],
	["Claymore", new Weapon("Claymore", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Cleaver", new Weapon("Cleaver", 10, wt.ONE_HANDED_SWINGING, ic.AXE, 4)],
	["Cloudy Sphere", new Weapon("Cloudy Sphere", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Club", new Weapon("Club", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Colossus Blade", new Weapon("Colossus Blade", 5, wt.TWO_HANDED_SWORD, ic.SWORD, 6)],
	["Colossus Crossbow", new Weapon("Colossus Crossbow", 10, wt.CROSSBOW, ic.MISSILE, 6)],
	["Colossus Sword", new Weapon("Colossus Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 5)],
	["Colossus Voulge", new Weapon("Colossus Voulge", 10, wt.TWO_HANDED, ic.POLEARM, 4)],
	["Composite Bow", new Weapon("Composite Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Conquest Sword", new Weapon("Conquest Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Crossbow", new Weapon("Crossbow", 0, wt.CROSSBOW, ic.MISSILE, 4)],
	["Crowbill", new Weapon("Crowbill", -10, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["Crusader Bow", new Weapon("Crusader Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Cryptic Axe", new Weapon("Cryptic Axe", 10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Cryptic Sword", new Weapon("Cryptic Sword", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Crystal Sword", new Weapon("Crystal Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 6)],
	["Crystalline Globe", new Weapon("Crystalline Globe", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Cudgel", new Weapon("Cudgel", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Cutlass", new Weapon("Cutlass", -30, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Dacian Falx", new Weapon("Dacian Falx", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Dagger", new Weapon("Dagger", -20, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Decapitator", new Weapon("Decapitator", 10, wt.TWO_HANDED, ic.AXE, 5)],
	["Demon Crossbow", new Weapon("Demon Crossbow", -60, wt.CROSSBOW, ic.MISSILE, 5)],
	["Demon Heart", new Weapon("Demon Heart", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Devil Star", new Weapon("Devil Star", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Diamond Bow", new Weapon("Diamond Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Dimensional Blade", new Weapon("Dimensional Blade", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 6)],
	["Dimensional Shard", new Weapon("Dimensional Shard", 10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Dirk", new Weapon("Dirk", 0, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Divine Scepter", new Weapon("Divine Scepter", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Double Axe", new Weapon("Double Axe", 10, wt.ONE_HANDED_SWINGING, ic.AXE, 5)],
	["Double Bow", new Weapon("Double Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Eagle Orb", new Weapon("Eagle Orb", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Edge Bow", new Weapon("Edge Bow", 5, wt.BOW, ic.MISSILE, 3)],
	["Elder Staff", new Weapon("Elder Staff", 0, wt.TWO_HANDED, ic.STAFF, 4)],
	["Eldritch Orb", new Weapon("Eldritch Orb", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Elegant Blade", new Weapon("Elegant Blade", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Espandon", new Weapon("Espandon", 0, wt.TWO_HANDED_SWORD, ic.SWORD, 3)],
	["Ettin Axe", new Weapon("Ettin Axe", 10, wt.ONE_HANDED_SWINGING, ic.AXE, 5)],
	["Executioner Sword", new Weapon("Executioner Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 6)],
	["Falcata", new Weapon("Falcata", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Falchion", new Weapon("Falchion", 20, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Fanged Knife", new Weapon("Fanged Knife", -20, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 3)],
	["Fascia", new Weapon("Fascia", 10, wt.CLAW, ic.CLAW, 2)],
	["Feral Axe", new Weapon("Feral Axe", -15, wt.TWO_HANDED, ic.AXE, 4)],
	["Feral Claws", new Weapon("Feral Claws", -20, wt.CLAW, ic.CLAW, 3)],
	["Flail", new Weapon("Flail", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Flamberge", new Weapon("Flamberge", -10, wt.TWO_HANDED_SWORD, ic.SWORD, 5)],
	["Flanged Mace", new Weapon("Flanged Mace", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Flying Axe", new Weapon("Flying Axe", 10, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Flying Knife", new Weapon("Flying Knife", 0, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Francisca", new Weapon("Francisca", 10, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Fuscina", new Weapon("Fuscina", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 4)],
	["Ghost Glaive", new Weapon("Ghost Glaive", 20, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Ghost Spear", new Weapon("Ghost Spear", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Ghost Wand", new Weapon("Ghost Wand", 10, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Giant Axe", new Weapon("Giant Axe", 10, wt.TWO_HANDED, ic.AXE, 6)],
	["Giant Sword", new Weapon("Giant Sword", 0, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Giant Thresher", new Weapon("Giant Thresher", -10, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Gladius", new Weapon("Gladius", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Glaive", new Weapon("Glaive", 20, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Glorious Axe", new Weapon("Glorious Axe", 10, wt.TWO_HANDED, ic.AXE, 6)],
	["Glowing Orb", new Weapon("Glowing Orb", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Gnarled Staff", new Weapon("Gnarled Staff", 10, wt.TWO_HANDED, ic.STAFF, 4)],
	["Gorgon Crossbow", new Weapon("Gorgon Crossbow", 0, wt.CROSSBOW, ic.MISSILE, 4)],
	["Gothic Axe", new Weapon("Gothic Axe", -10, wt.TWO_HANDED, ic.AXE, 6)],
	["Gothic Bow", new Weapon("Gothic Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Gothic Staff", new Weapon("Gothic Staff", 0, wt.TWO_HANDED, ic.STAFF, 4)],
	["Gothic Sword", new Weapon("Gothic Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Grand Matron Bow", new Weapon("Grand Matron Bow", 10, wt.BOW, ic.MISSILE, 5)],
	["Grand Scepter", new Weapon("Grand Scepter", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Grave Wand", new Weapon("Grave Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Great Axe", new Weapon("Great Axe", -10, wt.TWO_HANDED, ic.AXE, 6)],
	["Great Bow", new Weapon("Great Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Great Maul", new Weapon("Great Maul", 20, wt.TWO_HANDED, ic.MACE, 6)],
	["Great Pilum", new Weapon("Great Pilum", 0, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Great Poleaxe", new Weapon("Great Poleaxe", 0, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Great Sword", new Weapon("Great Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 6)],
	["Greater Claws", new Weapon("Greater Claws", -20, wt.CLAW, ic.CLAW, 3)],
	["Greater Talons", new Weapon("Greater Talons", -30, wt.CLAW, ic.CLAW, 3)],
	["Grim Scythe", new Weapon("Grim Scythe", -10, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Grim Wand", new Weapon("Grim Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Halberd", new Weapon("Halberd", 0, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Hand Axe", new Weapon("Hand Axe", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 2)],
	["Hand Scythe", new Weapon("Hand Scythe", -10, wt.CLAW, ic.CLAW, 2)],
	["Harpoon", new Weapon("Harpoon", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Hatchet Hands", new Weapon("Hatchet Hands", 10, wt.CLAW, ic.CLAW, 2)],
	["Hatchet", new Weapon("Hatchet", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 2)],
	["Heavenly Stone", new Weapon("Heavenly Stone", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Heavy Crossbow", new Weapon("Heavy Crossbow", 10, wt.CROSSBOW, ic.MISSILE, 6)],
	["Highland Blade", new Weapon("Highland Blade", -5, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Holy Water Sprinkler", new Weapon("Holy Water Sprinkler", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Hunter's Bow", new Weapon("Hunter's Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Hurlbat", new Weapon("Hurlbat", -10, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Hydra Bow", new Weapon("Hydra Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Hydra Edge", new Weapon("Hydra Edge", 10, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Hyperion Javelin", new Weapon("Hyperion Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Hyperion Spear", new Weapon("Hyperion Spear", -10, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 3)],
	["Jagged Star", new Weapon("Jagged Star", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Jared's Stone", new Weapon("Jared's Stone", 10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Javelin", new Weapon("Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Jo Staff", new Weapon("Jo Staff", -10, wt.TWO_HANDED, ic.STAFF, 2)],
	["Katar", new Weapon("Katar", -10, wt.CLAW, ic.CLAW, 2)],
	["Knout", new Weapon("Knout", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Kris", new Weapon("Kris", -20, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 3)],
	["Lance", new Weapon("Lance", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Large Axe", new Weapon("Large Axe", -10, wt.TWO_HANDED, ic.AXE, 4)],
	["Large Siege Bow", new Weapon("Large Siege Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Legend Spike", new Weapon("Legend Spike", -10, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 2)],
	["Legend Sword", new Weapon("Legend Sword", -15, wt.TWO_HANDED_SWORD, ic.SWORD, 3)],
	["Legendary Mallet", new Weapon("Legendary Mallet", 20, wt.ONE_HANDED_SWINGING, ic.MACE, 4)],
	["Lich Wand", new Weapon("Lich Wand", -20, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Light Crossbow", new Weapon("Light Crossbow", -10, wt.CROSSBOW, ic.MISSILE, 3)],
	["Lochaber Axe", new Weapon("Lochaber Axe", 10, wt.TWO_HANDED, ic.POLEARM, 3)],
	["Long Battle Bow", new Weapon("Long Battle Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Long Bow", new Weapon("Long Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Long Staff", new Weapon("Long Staff", 0, wt.TWO_HANDED, ic.STAFF, 3)],
	["Long Sword", new Weapon("Long Sword", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Long War Bow", new Weapon("Long War Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Mace", new Weapon("Mace", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Maiden Javelin", new Weapon("Maiden Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Maiden Pike", new Weapon("Maiden Pike", 10, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Maiden Spear", new Weapon("Maiden Spear", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Mancatcher", new Weapon("Mancatcher", -20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 5)],
	["Martel de Fer", new Weapon("Martel de Fer", 20, wt.TWO_HANDED, ic.MACE, 6)],
	["Matriarchal Bow", new Weapon("Matriarchal Bow", -10, wt.BOW, ic.MISSILE, 5)],
	["Matriarchal Javelin", new Weapon("Matriarchal Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Matriarchal Pike", new Weapon("Matriarchal Pike", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Matriarchal Spear", new Weapon("Matriarchal Spear", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Maul", new Weapon("Maul", 10, wt.TWO_HANDED, ic.MACE, 6)],
	["Mighty Scepter", new Weapon("Mighty Scepter", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Military Axe", new Weapon("Military Axe", -10, wt.TWO_HANDED, ic.AXE, 4)],
	["Military Pick", new Weapon("Military Pick", -10, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["Mithril Point", new Weapon("Mithril Point", 0, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Morning Star", new Weapon("Morning Star", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Mythical Sword", new Weapon("Mythical Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 3)],
	["Naga", new Weapon("Naga", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["Ogre Axe", new Weapon("Ogre Axe", 0, wt.TWO_HANDED, ic.POLEARM, 3)],
	["Ogre Maul", new Weapon("Ogre Maul", 10, wt.TWO_HANDED, ic.MACE, 6)],
	["Partizan", new Weapon("Partizan", 10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Pellet Bow", new Weapon("Pellet Bow", -10, wt.CROSSBOW, ic.MISSILE, 3)],
	["Petrified Wand", new Weapon("Petrified Wand", 10, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Phase Blade", new Weapon("Phase Blade", -30, wt.ONE_HANDED_SWINGING, ic.SWORD, 6)],
	["Pike", new Weapon("Pike", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Pilum", new Weapon("Pilum", 0, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Poignard", new Weapon("Poignard", -20, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Poleaxe", new Weapon("Poleaxe", 10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Polished Wand", new Weapon("Polished Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Quarterstaff", new Weapon("Quarterstaff", 0, wt.TWO_HANDED, ic.STAFF, 3)],
	["Quhab", new Weapon("Quhab", 0, wt.CLAW, ic.CLAW, 3)],
	["Razor Bow", new Weapon("Razor Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Reflex Bow", new Weapon("Reflex Bow", 10, wt.BOW, ic.MISSILE, 5)],
	["Reinforced Mace", new Weapon("Reinforced Mace", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Repeating Crossbow", new Weapon("Repeating Crossbow", -40, wt.CROSSBOW, ic.MISSILE, 5)],
	["Rondel", new Weapon("Rondel", 0, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Rune Bow", new Weapon("Rune Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Rune Scepter", new Weapon("Rune Scepter", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Rune Staff", new Weapon("Rune Staff", 20, wt.TWO_HANDED, ic.STAFF, 6)],
	["Rune Sword", new Weapon("Rune Sword", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Runic Talons", new Weapon("Runic Talons", -30, wt.CLAW, ic.CLAW, 3)],
	["Sabre", new Weapon("Sabre", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Sacred Globe", new Weapon("Sacred Globe", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Scepter", new Weapon("Scepter", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Scimitar", new Weapon("Scimitar", -20, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Scissors Katar", new Weapon("Scissors Katar", -10, wt.CLAW, ic.CLAW, 3)],
	["Scissors Quhab", new Weapon("Scissors Quhab", 0, wt.CLAW, ic.CLAW, 3)],
	["Scissors Suwayyah", new Weapon("Scissors Suwayyah", 0, wt.CLAW, ic.CLAW, 3)],
	["Scourge", new Weapon("Scourge", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Scythe", new Weapon("Scythe", -10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Seraph Rod", new Weapon("Seraph Rod", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Shadow Bow", new Weapon("Shadow Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Shamshir", new Weapon("Shamshir", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Shillelagh", new Weapon("Shillelagh", 0, wt.TWO_HANDED, ic.STAFF, 4)],
	["Short Battle Bow", new Weapon("Short Battle Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Short Bow", new Weapon("Short Bow", 5, wt.BOW, ic.MISSILE, 3)],
	["Short Siege Bow", new Weapon("Short Siege Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Short Spear", new Weapon("Short Spear", 10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Short Staff", new Weapon("Short Staff", -10, wt.TWO_HANDED, ic.STAFF, 2)],
	["Short Sword", new Weapon("Short Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Short War Bow", new Weapon("Short War Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Siege Crossbow", new Weapon("Siege Crossbow", 0, wt.CROSSBOW, ic.MISSILE, 4)],
	["Silver-edged Axe", new Weapon("Silver-edged Axe", 0, wt.TWO_HANDED, ic.AXE, 5)],
	["Simbilan", new Weapon("Simbilan", 10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Small Crescent", new Weapon("Small Crescent", 10, wt.ONE_HANDED_SWINGING, ic.AXE, 4)],
	["Smoked Sphere", new Weapon("Smoked Sphere", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Sparkling Ball", new Weapon("Sparkling Ball", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Spear", new Weapon("Spear", -10, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 3)],
	["Spetum", new Weapon("Spetum", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Spiculum", new Weapon("Spiculum", 20, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Spider Bow", new Weapon("Spider Bow", 5, wt.BOW, ic.MISSILE, 3)],
	["Spiked Club", new Weapon("Spiked Club", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Stag Bow", new Weapon("Stag Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Stalagmite", new Weapon("Stalagmite", 10, wt.TWO_HANDED, ic.STAFF, 3)],
	["Stiletto", new Weapon("Stiletto", -10, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 2)],
	["Stygian Pike", new Weapon("Stygian Pike", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 4)],
	["Stygian Pilum", new Weapon("Stygian Pilum", 0, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Suwayyah", new Weapon("Suwayyah", 0, wt.CLAW, ic.CLAW, 3)],
	["Swirling Crystal", new Weapon("Swirling Crystal", 10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Tabar", new Weapon("Tabar", 10, wt.TWO_HANDED, ic.AXE, 5)],
	["Thresher", new Weapon("Thresher", -10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Throwing Axe", new Weapon("Throwing Axe", 10, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Throwing Knife", new Weapon("Throwing Knife", 0, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Throwing Spear", new Weapon("Throwing Spear", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Thunder Maul", new Weapon("Thunder Maul", 20, wt.TWO_HANDED, ic.MACE, 6)],
	["Tomahawk", new Weapon("Tomahawk", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 2)],
	["Tomb Wand", new Weapon("Tomb Wand", -20, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Trident", new Weapon("Trident", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 4)],
	["Truncheon", new Weapon("Truncheon", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Tulwar", new Weapon("Tulwar", 20, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Tusk Sword", new Weapon("Tusk Sword", 0, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Twin Axe", new Weapon("Twin Axe", 10, wt.ONE_HANDED_SWINGING, ic.AXE, 5)],
	["Two-Handed Sword", new Weapon("Two-Handed Sword", 0, wt.TWO_HANDED_SWORD, ic.SWORD, 3)],
	["Tyrant Club", new Weapon("Tyrant Club", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Unearthed Wand", new Weapon("Unearthed Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Vortex Orb", new Weapon("Vortex Orb", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Voulge", new Weapon("Voulge", 0, wt.TWO_HANDED, ic.POLEARM, 4)],
	["Walking Stick", new Weapon("Walking Stick", -10, wt.TWO_HANDED, ic.STAFF, 2)],
	["Wand", new Weapon("Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 1)],
	["War Axe", new Weapon("War Axe", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["War Club", new Weapon("War Club", 10, wt.TWO_HANDED, ic.MACE, 6)],
	["War Dart", new Weapon("War Dart", -20, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["War Fist", new Weapon("War Fist", 10, wt.CLAW, ic.CLAW, 2)],
	["War Fork", new Weapon("War Fork", -20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 5)],
	["War Hammer", new Weapon("War Hammer", 20, wt.ONE_HANDED_SWINGING, ic.MACE, 4)],
	["War Javelin", new Weapon("War Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["War Pike", new Weapon("War Pike", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["War Scepter", new Weapon("War Scepter", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["War Scythe", new Weapon("War Scythe", -10, wt.TWO_HANDED, ic.POLEARM, 6)],
	["War Spear", new Weapon("War Spear", -10, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 3)],
	["War Spike", new Weapon("War Spike", -10, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["War Staff", new Weapon("War Staff", 20, wt.TWO_HANDED, ic.STAFF, 6)],
	["War Sword", new Weapon("War Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 3)],
	["Ward Bow", new Weapon("Ward Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Winged Axe", new Weapon("Winged Axe", -10, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Winged Harpoon", new Weapon("Winged Harpoon", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Winged Knife", new Weapon("Winged Knife", -20, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Wrist Blade", new Weapon("Wrist Blade", 0, wt.CLAW, ic.CLAW, 2)],
	["Wrist Spike", new Weapon("Wrist Spike", -10, wt.CLAW, ic.CLAW, 2)],
	["Wrist Sword", new Weapon("Wrist Sword", -10, wt.CLAW, ic.CLAW, 3)],
	["Yari", new Weapon("Yari", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Yew Wand", new Weapon("Yew Wand", 10, wt.ONE_HANDED_SWINGING, ic.STAFF, 1)],
	["Zweihander", new Weapon("Zweihander", -10, wt.TWO_HANDED_SWORD, ic.SWORD, 5)]
]);

export function getWeapon(name) {
	return weaponsMap.get(name);
}

export { container, select, number, checkbox, option, button, skill, other, debug, tv, char, wf, skills, wt, ic, weaponsMap, LINK_SEPARATOR };

export function setupInputElement(element, eventListener) {
    if (element.type == "button") {
        element.addEventListener("click", eventListener, false);
    } else {
        element.addEventListener("change", eventListener, false);
        if (element.type == "number") {
            element.onkeydown = function (e) { // only allows the input of numbers, no negative signs
                if (!((e.keyCode > 95 && e.keyCode < 106) || (e.keyCode > 47 && e.keyCode < 58) || e.keyCode == 8)) {
                    return false;
                }
            }
        }
    }
	return element;
}

export function setupUpdateTableInputElements(eventListener) {
    setupInputElement(number.PRIMARY_WEAPON_IAS, eventListener);
    setupInputElement(number.PRIMARY_WEAPON_IAS, eventListener);
	setupInputElement(number.SECONDARY_WEAPON_IAS, eventListener);
	setupInputElement(number.IAS, eventListener);
	setupInputElement(number.FANATICISM, eventListener);
	setupInputElement(number.BURST_OF_SPEED, eventListener);
	setupInputElement(number.WEREWOLF, eventListener);
	setupInputElement(number.MAUL, eventListener);
	setupInputElement(number.FRENZY, eventListener);
	setupInputElement(number.HOLY_FREEZE, eventListener);
	setupInputElement(number.SLOWED_BY, eventListener);
    
	setupInputElement(checkbox.IS_ONE_HANDED, eventListener);
	setupInputElement(checkbox.MARK_OF_BEAR, eventListener);
	setupInputElement(checkbox.DECREPIFY, eventListener);
	setupInputElement(checkbox.CHILLED, eventListener);
}

export function convertIAStoEIAS(IAS) {
	let a = parseInt(120 * IAS / (120 + IAS));
	//console.log("convertIAStoEIAS: ", IAS, "->", a);
	return a;
}

export function convertEIAStoIAS(EIAS) {
	let a = Math.ceil(120 * EIAS / (120 - EIAS));
	//console.log("convertEIAStoIAS: ", EIAS, "->", a);
	return a;
}

export const zh = {
  skill: new Map([
    ["Standard", "普通攻擊"],
    ["Throw", "投擲"],
    ["Kick", "踢擊"],

    ["Dodge", "閃躲"],
    ["Impale", "穿刺"],
    ["Jab", "戳刺"],
    ["Strafe", "掃射"],
    ["Fend", "疾刺"],

    ["Tiger Strike", "猛虎擊"],
	["Cobra Strike", "靈蛇擊 Cobra Strike"],
  	["Phoenix Strike", "鳳凰擊 Phoenix Strike"],
  	["Fists of Fire", "烈火拳 Fists of Fire"],
 	["Claws of Thunder", "雷電爪 Claws of Thunder"],
 	["Blades of Ice", "寒冰刃 Blades of Ice"],
 	["Dragon Claw", "雙龍爪 Dragon Claw"],
 	["Dragon Tail", "龍擺尾 Dragon Tail"],
    ["Dragon Talon", "龍爪踢 Dragon Talon"],
    ["Laying Traps", "施放陷阱 Laying Traps"],

    ["Double Swing", "雙手揮擊 Double Swing"],
    ["Frenzy", "狂亂連擊 Frenzy"],
    ["Taunt", "嘲諷 Taunt"],
    ["Double Throw", "雙手投擲 Double Throw"],
    ["Whirlwind", "旋風斬 Whirlwind"],
    ["Concentrate", "專注打擊 Concentrate"],
    ["Berserk", "狂暴之擊 Berserk"],
    ["Bash", "猛擊 Bash"],
    ["Stun", "擊昏 Stun"],

    ["Feral Rage", "野性狂暴 Feral Rage"],
    ["Hunger", "飢餓噬咬 Hunger"],
    ["Rabies", "狂犬撕咬 Rabies"],
    ["Fury", "狂怒連擊 Fury"],

    ["Zeal", "熱忱打擊 Zeal"],
    ["Smite", "盾牌重擊 Smite"],
    ["Sacrifice", "犧牲打擊 Sacrifice"],
    ["Vengeance", "復仇打擊 Vengeance"],
    ["Conversion", "招降打擊 Conversion"],
  ]),

  weapon: new Map([
    ["None", "無 None"],
    ["Ancient Axe", "上古斧 Ancient Axe"],
    ["Ancient Sword", "上古劍 Ancient Sword"],
    ["Arbalest", "鋼弩 Arbalest"],
    ["Archon Staff", "統御者法杖 Archon Staff"],
    ["Ashwood Bow", "梣木弓 Ashwood Bow"],
	["Ataghan", "阿塔甘刀 Ataghan"],
	["Axe", "斧 Axe"],
	["Balanced Axe", "平衡斧 Balanced Axe"],
	["Balanced Knife", "平衡小刀 Balanced Knife"],
	["Ballista", "弩炮 Ballista"],
	["Balrog Blade", "巴洛刃 Balrog Blade"],
	["Balrog Spear", "巴洛矛 Balrog Spear"],
	["Barbed Club", "倒刺棍棒 Barbed Club"],
	["Bardiche", "長柄斧 Bardiche"],
	["Bastard Sword", "私生劍 Bastard Sword"],
	["Battle Axe", "戰斧 Battle Axe"],
	["Battle Cestus", "戰鬥拳刃 Battle Cestus"],
	["Battle Dart", "戰鬥飛鏢 Battle Dart"],
	["Battle Hammer", "戰鎚 Battle Hammer"],
	["Battle Scythe", "戰鬥長鐮 Battle Scythe"],
	["Battle Staff", "戰鬥法杖 Battle Staff"],
	["Battle Sword", "戰劍 Battle Sword"],
	["Bearded Axe", "鬍鬚斧 Bearded Axe"],
	["Bec-de-Corbin", "烏鴉嘴錘 Bec-de-Corbin"],
	["Berserker Axe", "狂戰士斧 Berserker Axe"],
	["Bill", "鉤鐮 Bill"],
	["Blade Bow", "刃弓 Blade Bow"],
	["Blade Talons", "刃爪 Blade Talons"],
	["Blade", "刃 Blade"],
	["Bone Knife", "骨刀 Bone Knife"],
	["Bone Wand", "骨杖 Bone Wand"],
	["Brandistock", "布蘭迪斯托克 Brandistock"],
	["Broad Axe", "闊斧 Broad Axe"],
	["Broad Sword", "闊劍 Broad Sword"],
	["Burnt Wand", "燒焦法杖 Burnt Wand"],
	["Caduceus", "雙蛇杖 Caduceus"],
	["Cedar Bow", "雪松弓 Cedar Bow"],
	["Cedar Staff", "雪松法杖 Cedar Staff"],
	["Ceremonial Bow", "典禮弓 Ceremonial Bow"],
	["Ceremonial Javelin", "典禮標槍 Ceremonial Javelin"],
	["Ceremonial Pike", "典禮長槍 Ceremonial Pike"],
	["Ceremonial Spear", "典禮長矛 Ceremonial Spear"],
	["Cestus", "拳刃 Cestus"],
	["Champion Axe", "冠軍斧 Champion Axe"],
	["Champion Sword", "冠軍劍 Champion Sword"],
	["Chu-Ko-Nu", "連弩 Chu-Ko-Nu"],
	["Cinquedeas", "五指匕首 Cinquedeas"],
	["Clasped Orb", "扣握寶珠 Clasped Orb"],
	["Claws", "爪 Claws"],
	["Claymore", "克萊莫爾大劍 Claymore"],
	["Cleaver", "剁刀 Cleaver"],
	["Cloudy Sphere", "朦朧球體 Cloudy Sphere"],
	["Club", "棍棒 Club"],
	["Colossus Blade", "巨神之刃 Colossus Blade"],
	["Colossus Crossbow", "巨神十字弓 Colossus Crossbow"],
	["Colossus Sword", "巨神之劍 Colossus Sword"],
	["Colossus Voulge", "巨神長柄斧 Colossus Voulge"],
	["Composite Bow", "複合弓 Composite Bow"],
	["Conquest Sword", "征服之劍 Conquest Sword"],
	["Crossbow", "十字弓 Crossbow"],
	["Crowbill", "鴉嘴錘 Crowbill"],
	["Crusader Bow", "十字軍弓 Crusader Bow"],
	["Cryptic Axe", "神祕斧 Cryptic Axe"],
	["Cryptic Sword", "神祕劍 Cryptic Sword"],
	["Crystal Sword", "水晶劍 Crystal Sword"],
	["Crystalline Globe", "水晶球體 Crystalline Globe"],
	["Cudgel", "短棒 Cudgel"],
	["Cutlass", "彎刀 Cutlass"],
	["Dacian Falx", "達契亞鐮刀 Dacian Falx"],
	["Dagger", "匕首 Dagger"],
	["Decapitator", "斬首斧 Decapitator"],
	["Demon Crossbow", "惡魔十字弓 Demon Crossbow"],
	["Demon Heart", "惡魔之心 Demon Heart"],
	["Devil Star", "惡魔星錘 Devil Star"],
	["Diamond Bow", "鑽石弓 Diamond Bow"],
	["Dimensional Blade", "次元之刃 Dimensional Blade"],
	["Dimensional Shard", "次元碎片 Dimensional Shard"],
	["Dirk", "短匕 Dirk"],
	["Divine Scepter", "神聖權杖 Divine Scepter"],
	["Double Axe", "雙斧 Double Axe"],
	["Double Bow", "雙弓 Double Bow"],
	["Eagle Orb", "雄鷹寶珠 Eagle Orb"],
	["Edge Bow", "刃緣弓 Edge Bow"],
	["Elder Staff", "長老法杖 Elder Staff"],
	["Eldritch Orb", "詭異寶珠 Eldritch Orb"],
	["Elegant Blade", "優雅之刃 Elegant Blade"],
	["Espandon", "埃斯潘頓大劍 Espandon"],
	["Ettin Axe", "雙頭巨人斧 Ettin Axe"],
	["Executioner Sword", "行刑者之劍 Executioner Sword"],
	["Falcata", "法爾卡塔彎刀 Falcata"],
	["Falchion", "彎刃劍 Falchion"],
	["Fanged Knife", "尖牙刀 Fanged Knife"],
	["Fascia", "法西亞 Fascia"],
	["Feral Axe", "野性斧 Feral Axe"],
	["Feral Claws", "野性爪 Feral Claws"],
	["Flail", "連枷 Flail"],
	["Flamberge", "火焰大劍 Flamberge"],
	["Flanged Mace", "凸緣釘鎚 Flanged Mace"],
	["Flying Axe", "飛斧 Flying Axe"],
	["Flying Knife", "飛刀 Flying Knife"],
	["Francisca", "法蘭西斯卡飛斧 Francisca"],
	["Fuscina", "三叉矛 Fuscina"],
	["Ghost Glaive", "幽魂關刀 Ghost Glaive"],
	["Ghost Spear", "幽魂長矛 Ghost Spear"],
	["Ghost Wand", "幽魂法杖 Ghost Wand"],
	["Giant Axe", "巨人斧 Giant Axe"],
	["Giant Sword", "巨人大劍 Giant Sword"],
	["Giant Thresher", "巨型長柄鐮 Giant Thresher"],
	["Gladius", "羅馬短劍 Gladius"],
	["Glaive", "關刀 Glaive"],
	["Glorious Axe", "榮耀之斧 Glorious Axe"],
	["Glowing Orb", "發光寶珠 Glowing Orb"],
	["Gnarled Staff", "扭曲法杖 Gnarled Staff"],
	["Gorgon Crossbow", "蛇髮女妖十字弓 Gorgon Crossbow"],
	["Gothic Axe", "哥德斧 Gothic Axe"],
	["Gothic Bow", "哥德弓 Gothic Bow"],
	["Gothic Staff", "哥德法杖 Gothic Staff"],
	["Gothic Sword", "哥德劍 Gothic Sword"],
	["Grand Matron Bow", "宗師女族長之弓 Grand Matron Bow"],
	["Grand Scepter", "宗師權杖 Grand Scepter"],
	["Grave Wand", "墓穴法杖 Grave Wand"],
	["Great Axe", "巨斧 Great Axe"],
	["Great Bow", "巨弓 Great Bow"],
	["Great Maul", "巨型鎚 Great Maul"],
	["Great Pilum", "巨型標槍 Great Pilum"],
	["Great Poleaxe", "巨型長柄斧 Great Poleaxe"],
	["Great Sword", "巨劍 Great Sword"],
	["Greater Claws", "強化利爪 Greater Claws"],
	["Greater Talons", "強化猛爪 Greater Talons"],
	["Grim Scythe", "陰森長鐮 Grim Scythe"],
	["Grim Wand", "陰森法杖 Grim Wand"],
	["Halberd", "戟 Halberd"],
	["Hand Axe", "手斧 Hand Axe"],
	["Hand Scythe", "手鐮 Hand Scythe"],
	["Harpoon", "魚叉 Harpoon"],
	["Hatchet Hands", "斧手爪 Hatchet Hands"],
	["Hatchet", "小斧 Hatchet"],
	["Heavenly Stone", "天界之石 Heavenly Stone"],
	["Heavy Crossbow", "重型十字弓 Heavy Crossbow"],
	["Highland Blade", "高地之刃 Highland Blade"],
	["Holy Water Sprinkler", "聖水灑器 Holy Water Sprinkler"],
	["Hunter's Bow", "獵人之弓 Hunter's Bow"],
	["Hurlbat", "投擲棒 Hurlbat"],
	["Hydra Bow", "九頭蛇之弓 Hydra Bow"],
	["Hydra Edge", "九頭蛇之刃 Hydra Edge"],
	["Hyperion Javelin", "海伯利昂標槍 Hyperion Javelin"],
	["Hyperion Spear", "海伯利昂長矛 Hyperion Spear"],
	["Jagged Star", "鋸齒流星錘 Jagged Star"],
	["Jared's Stone", "賈瑞德之石 Jared's Stone"],
	["Javelin", "標槍 Javelin"],
	["Jo Staff", "短棍 Jo Staff"],
	["Katar", "拳刃 Katar"],
	["Knout", "皮鞭 Knout"],
	["Kris", "克里斯匕首 Kris"],
	["Lance", "騎槍 Lance"],
	["Large Axe", "大型斧 Large Axe"],
	["Large Siege Bow", "大型攻城弓 Large Siege Bow"],
	["Legend Spike", "傳奇尖刺 Legend Spike"],
	["Legend Sword", "傳奇之劍 Legend Sword"],
	["Legendary Mallet", "傳奇木槌 Legendary Mallet"],
	["Lich Wand", "巫妖法杖 Lich Wand"],
	["Light Crossbow", "輕型十字弓 Light Crossbow"],
	["Lochaber Axe", "洛哈伯斧 Lochaber Axe"],
	["Long Battle Bow", "長戰弓 Long Battle Bow"],
	["Long Bow", "長弓 Long Bow"],
	["Long Staff", "長法杖 Long Staff"],
	["Long Sword", "長劍 Long Sword"],
	["Long War Bow", "長戰爭弓 Long War Bow"],
	["Mace", "釘鎚 Mace"],
	["Maiden Javelin", "少女標槍 Maiden Javelin"],
	["Maiden Pike", "少女長槍 Maiden Pike"],
	["Maiden Spear", "少女長矛 Maiden Spear"],
	["Mancatcher", "捕人叉 Mancatcher"],
	["Martel de Fer", "鐵鎚 Martel de Fer"],
	["Matriarchal Bow", "女族長之弓 Matriarchal Bow"],
	["Matriarchal Javelin", "女族長標槍 Matriarchal Javelin"],
	["Matriarchal Pike", "女族長長槍 Matriarchal Pike"],
	["Matriarchal Spear", "女族長長矛 Matriarchal Spear"],
	["Maul", "巨鎚 Maul"],
	["Mighty Scepter", "強力權杖 Mighty Scepter"],
	["Military Axe", "軍用斧 Military Axe"],
	["Military Pick", "軍用鎬 Military Pick"],
	["Mithril Point", "秘銀尖刺 Mithril Point"],
	["Morning Star", "晨星錘 Morning Star"],
	["Mythical Sword", "神話之劍 Mythical Sword"],
	["Naga", "那伽斧 Naga"],
	["Ogre Axe", "食人魔斧 Ogre Axe"],
	["Ogre Maul", "食人魔巨鎚 Ogre Maul"],
	["Partizan", "帕提贊長槍 Partizan"],
	["Pellet Bow", "彈丸弓 Pellet Bow"],
	["Petrified Wand", "石化法杖 Petrified Wand"],
	["Phase Blade", "相位之刃 Phase Blade"],
	["Pike", "長槍 Pike"],
	["Pilum", "羅馬標槍 Pilum"],
	["Poignard", "短匕首 Poignard"],
	["Poleaxe", "長柄斧 Poleaxe"],
	["Polished Wand", "拋光法杖 Polished Wand"],
	["Quarterstaff", "四分棍 Quarterstaff"],
	["Quhab", "庫哈布拳刃 Quhab"],
	["Razor Bow", "剃刀弓 Razor Bow"],
	["Reflex Bow", "反曲弓 Reflex Bow"],
	["Reinforced Mace", "強化釘鎚 Reinforced Mace"],
	["Repeating Crossbow", "連發十字弓 Repeating Crossbow"],
	["Rondel", "圓錐匕首 Rondel"],
	["Rune Bow", "符文弓 Rune Bow"],
	["Rune Scepter", "符文權杖 Rune Scepter"],
	["Rune Staff", "符文法杖 Rune Staff"],
	["Rune Sword", "符文之劍 Rune Sword"],
	["Runic Talons", "符文猛爪 Runic Talons"],
	["Sabre", "軍刀 Sabre"],
	["Sacred Globe", "神聖寶珠 Sacred Globe"],
	["Scepter", "權杖 Scepter"],
	["Scimitar", "彎刀 Scimitar"],
	["Scissors Katar", "剪刃拳刃 Scissors Katar"],
	["Scissors Quhab", "剪刃庫哈布 Scissors Quhab"],
	["Scissors Suwayyah", "剪刃蘇瓦亞 Scissors Suwayyah"],
	["Scourge", "重鞭 Scourge"],
	["Scythe", "鐮刀 Scythe"],
	["Seraph Rod", "熾天使之杖 Seraph Rod"],
	["Shadow Bow", "暗影弓 Shadow Bow"],
	["Shamshir", "沙姆希爾彎刀 Shamshir"],
	["Shillelagh", "橡木棍 Shillelagh"],
	["Short Battle Bow", "短戰弓 Short Battle Bow"],
	["Short Bow", "短弓 Short Bow"],
	["Short Siege Bow", "短攻城弓 Short Siege Bow"],
	["Short Spear", "短矛 Short Spear"],
	["Short Staff", "短法杖 Short Staff"],
	["Short Sword", "短劍 Short Sword"],
	["Short War Bow", "短戰爭弓 Short War Bow"],
	["Siege Crossbow", "攻城十字弓 Siege Crossbow"],
	["Silver-edged Axe", "銀刃斧 Silver-edged Axe"],
	["Simbilan", "辛比蘭標槍 Simbilan"],
	["Small Crescent", "小型新月斧 Small Crescent"],
	["Smoked Sphere", "煙霧球體 Smoked Sphere"],
	["Sparkling Ball", "閃耀球體 Sparkling Ball"],
	["Spear", "長矛 Spear"],
	["Spetum", "斯佩圖姆長槍 Spetum"],
	["Spiculum", "斯皮庫魯姆標槍 Spiculum"],
	["Spider Bow", "蜘蛛弓 Spider Bow"],
	["Spiked Club", "尖刺棍棒 Spiked Club"],
	["Stag Bow", "雄鹿弓 Stag Bow"],
	["Stalagmite", "石筍法杖 Stalagmite"],
	["Stiletto", "細劍匕首 Stiletto"],
	["Stygian Pike", "冥河長槍 Stygian Pike"],
	["Stygian Pilum", "冥河標槍 Stygian Pilum"],
	["Suwayyah", "蘇瓦亞拳刃 Suwayyah"],
	["Swirling Crystal", "旋渦水晶 Swirling Crystal"],
	["Tabar", "塔巴爾斧 Tabar"],
	["Thresher", "長柄鐮 Thresher"],
	["Throwing Axe", "投擲斧 Throwing Axe"],
	["Throwing Knife", "投擲小刀 Throwing Knife"],
	["Throwing Spear", "投擲長矛 Throwing Spear"],
	["Thunder Maul", "雷霆巨鎚 Thunder Maul"],
	["Tomahawk", "戰斧 Tomahawk"],
	["Tomb Wand", "墓穴法杖 Tomb Wand"],
	["Trident", "三叉戟 Trident"],
	["Truncheon", "警棍 Truncheon"],
	["Tulwar", "圖爾瓦彎刀 Tulwar"],
	["Tusk Sword", "獠牙之劍 Tusk Sword"],
	["Twin Axe", "雙刃斧 Twin Axe"],
	["Two-Handed Sword", "雙手大劍 Two-Handed Sword"],
	["Tyrant Club", "暴君棍棒 Tyrant Club"],
	["Unearthed Wand", "出土法杖 Unearthed Wand"],
	["Vortex Orb", "漩渦寶珠 Vortex Orb"],
	["Voulge", "沃爾吉長柄斧 Voulge"],
	["Walking Stick", "手杖 Walking Stick"],
	["Wand", "法杖 Wand"],
	["War Axe", "戰斧 War Axe"],
	["War Club", "戰棍 War Club"],
	["War Dart", "戰鬥飛鏢 War Dart"],
	["War Fist", "戰拳 War Fist"],
	["War Fork", "戰叉 War Fork"],
	["War Hammer", "戰鎚 War Hammer"],
	["War Javelin", "戰標槍 War Javelin"],
	["War Pike", "戰長槍 War Pike"],
	["War Scepter", "戰權杖 War Scepter"],
	["War Scythe", "戰鐮 War Scythe"],
	["War Spear", "戰矛 War Spear"],
	["War Spike", "戰尖斧 War Spike"],
	["War Staff", "戰法杖 War Staff"],
	["War Sword", "戰劍 War Sword"],
	["Ward Bow", "守護之弓 Ward Bow"],
	["Winged Axe", "翼斧 Winged Axe"],
	["Winged Harpoon", "翼魚叉 Winged Harpoon"],
	["Winged Knife", "翼刀 Winged Knife"],
	["Wrist Blade", "腕刃 Wrist Blade"],
	["Wrist Spike", "腕刺 Wrist Spike"],
	["Wrist Sword", "腕劍 Wrist Sword"],
	["Yari", "槍 Yari"],
	["Yew Wand", "紫杉法杖 Yew Wand"],
	["Zweihander", "雙手巨劍 Zweihander"],
    // ...以下省略
  ])
};
