import type { SrdEntry } from "../../srd/schema";
import { AdversaryDetails } from "./AdversaryDetails";
import { AncestryDetails } from "./AncestryDetails";
import { ArmorDetails } from "./ArmorDetails";
import { ClassDetails } from "./ClassDetails";
import { CommunityDetails } from "./CommunityDetails";
import { DomainCardDetails } from "./DomainCardDetails";
import { EnvironmentDetails } from "./EnvironmentDetails";
import { LootDetails } from "./LootDetails";
import { RuleReferenceDetails } from "./RuleReferenceDetails";
import { SubclassDetails } from "./SubclassDetails";
import { WeaponDetails } from "./WeaponDetails";

export function KindDetails({ entry }: { entry: SrdEntry }) {
  switch (entry.kind) {
    case "class":
      return <ClassDetails entry={entry} />;
    case "subclass":
      return <SubclassDetails entry={entry} />;
    case "domain_card":
      return <DomainCardDetails entry={entry} />;
    case "weapon":
      return <WeaponDetails entry={entry} />;
    case "ancestry":
      return <AncestryDetails entry={entry} />;
    case "community":
      return <CommunityDetails entry={entry} />;
    case "armor":
      return <ArmorDetails entry={entry} />;
    case "loot":
      return <LootDetails entry={entry} />;
    case "adversary":
      return <AdversaryDetails entry={entry} />;
    case "environment":
      return <EnvironmentDetails entry={entry} />;
    case "rule_reference":
      return <RuleReferenceDetails entry={entry} />;
  }
}
