import adversaries from "../../data/srd/fixtures/adversaries.json";
import ancestries from "../../data/srd/fixtures/ancestries.json";
import armor from "../../data/srd/fixtures/armor.json";
import classes from "../../data/srd/fixtures/classes.json";
import communities from "../../data/srd/fixtures/communities.json";
import domainCards from "../../data/srd/fixtures/domain-cards.json";
import environments from "../../data/srd/fixtures/environments.json";
import loot from "../../data/srd/fixtures/loot.json";
import ruleReferences from "../../data/srd/fixtures/rule-references.json";
import subclasses from "../../data/srd/fixtures/subclasses.json";
import weapons from "../../data/srd/fixtures/weapons.json";

export const fixtureEntryFiles = [
  classes,
  subclasses,
  domainCards,
  weapons,
  ruleReferences,
  ancestries,
  communities,
  armor,
  loot,
  adversaries,
  environments,
] as const;

export const fixtureEntries = fixtureEntryFiles.flat();
