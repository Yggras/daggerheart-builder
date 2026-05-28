import { useRouter } from "expo-router";
import { Fragment } from "react";
import { StyleSheet, Text, type TextStyle, View } from "react-native";
import { getFieldLink } from "../fieldLinks";
import type { SrdEntry } from "../../srd/schema";
import { colors, radii } from "../../theme";
import { LinkedText } from "./LinkedText";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.keyValue}>
      <Text style={styles.key}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

// Inline text that links to a rule reference when the field/value pair maps to
// one, otherwise renders plain. Use inside KeyValue-style rows, stat blocks, or
// comma-separated value lists.
export function LinkedValue({
  field,
  value,
  display,
  style,
}: {
  field: string;
  value: string;
  display?: string;
  style?: TextStyle | TextStyle[];
}) {
  const router = useRouter();
  const link = getFieldLink(field, value);
  const label = display ?? value;

  if (!link) {
    return <Text style={style}>{label}</Text>;
  }

  return (
    <Text
      style={[style, styles.linkedValue]}
      onPress={() =>
        router.push({ pathname: "/compendium/[kind]/[id]", params: { kind: link.entryKind, id: link.entryId } })
      }
    >
      {label}
    </Text>
  );
}

export function LinkedKeyValue({
  label,
  value,
  field,
  linkValue,
}: {
  label: string;
  value: string;
  field: string;
  linkValue?: string;
}) {
  return (
    <View style={styles.keyValue}>
      <Text style={styles.key}>{label}</Text>
      <LinkedValue field={field} value={linkValue ?? value} display={value} style={styles.value} />
    </View>
  );
}

// A key/value row whose value is a comma-separated list of independently-linked
// values (e.g. a class's two domains, each linking to the Domains rule).
export function LinkedKeyValueList({
  label,
  field,
  values,
  formatValue,
}: {
  label: string;
  field: string;
  values: string[];
  formatValue?: (value: string) => string;
}) {
  return (
    <View style={styles.keyValue}>
      <Text style={styles.key}>{label}</Text>
      <Text style={styles.value}>
        {values.map((value, i) => (
          <Fragment key={value}>
            {i > 0 ? ", " : null}
            <LinkedValue field={field} value={value} display={formatValue ? formatValue(value) : value} style={styles.value} />
          </Fragment>
        ))}
      </Text>
    </View>
  );
}

export function Feature({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureTitle}>{title}</Text>
      <LinkedText text={text} style={styles.body} />
    </View>
  );
}

export function formatThresholds(thresholds: { major: number | null; severe: number | null }) {
  if (thresholds.major === null && thresholds.severe === null) {
    return "None";
  }
  return `${thresholds.major ?? "None"}/${thresholds.severe ?? "None"}`;
}

export function formatAttack(attack: Extract<SrdEntry, { kind: "adversary" }>["attack"]) {
  const modifier =
    typeof attack.modifier === "number" ? `${attack.modifier >= 0 ? "+" : ""}${attack.modifier}` : attack.modifier;
  return `${modifier} | ${attack.name}: ${attack.range} | ${attack.damage.roll} ${attack.damage.type}`;
}

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  keyValue: {
    gap: 2,
  },
  key: {
    color: colors.accentBold,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  value: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  linkedValue: {
    color: colors.link,
    textDecorationLine: "underline",
  },
  feature: {
    gap: 4,
  },
  featureTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
