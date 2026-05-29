import type { Character } from "../../schema";

// Shared props for every wizard step body: the loaded draft + the debounced mutator.
export type StepProps = {
  character: Character;
  update: (mutate: (character: Character) => void) => void;
};

const labels: Record<string, string> = {
  melee: "Melee",
  very_close: "Very Close",
  close: "Close",
  far: "Far",
  very_far: "Very Far",
};

export function formatRange(range: string): string {
  return labels[range] ?? range;
}
