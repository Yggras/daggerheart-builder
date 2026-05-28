import { Image, StyleSheet, View } from "react-native";
import type { SrdEntry } from "../../srd/schema";
import { colors, radii } from "../../theme";
import { ancestryImages } from "../ancestryImages";
import { Feature, Section } from "../components/Section";

export function AncestryDetails({ entry }: { entry: Extract<SrdEntry, { kind: "ancestry" }> }) {
  const image = ancestryImages[entry.slug];

  return (
    <>
      {image ? (
        <View style={styles.artCard}>
          <Image
            source={image}
            style={styles.artImage}
            resizeMode="contain"
            accessibilityLabel={`${entry.name} ancestry art`}
          />
        </View>
      ) : null}

      <Section title="Ancestry Details">
        {entry.features.map((feature) => (
          <Feature key={feature.name} title={feature.name} text={feature.text} />
        ))}
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  artCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    overflow: "hidden",
    padding: 12,
  },
  artImage: {
    width: "100%",
    height: 340,
  },
});
