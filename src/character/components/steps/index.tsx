import type { StepSlug } from "../../steps";
import { ClassStep } from "./ClassStep";
import { DetailsStep } from "./DetailsStep";
import { DomainsStep } from "./DomainsStep";
import { EquipmentStep } from "./EquipmentStep";
import { ExperiencesStep } from "./ExperiencesStep";
import { HeritageStep } from "./HeritageStep";
import { QuestionsStep } from "./QuestionsStep";
import { TraitsStep } from "./TraitsStep";
import type { StepProps } from "./types";

// Dispatches a step slug to its body component.
export function StepBody({ slug, character, update }: StepProps & { slug: StepSlug }) {
  switch (slug) {
    case "class":
      return <ClassStep character={character} update={update} />;
    case "heritage":
      return <HeritageStep character={character} update={update} />;
    case "traits":
      return <TraitsStep character={character} update={update} />;
    case "details":
      return <DetailsStep character={character} update={update} />;
    case "equipment":
      return <EquipmentStep character={character} update={update} />;
    case "background":
      return <QuestionsStep character={character} update={update} kind="background" />;
    case "experiences":
      return <ExperiencesStep character={character} update={update} />;
    case "domains":
      return <DomainsStep character={character} update={update} />;
    case "connections":
      return <QuestionsStep character={character} update={update} kind="connections" />;
    default:
      return null;
  }
}
