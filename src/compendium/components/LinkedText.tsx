import { useRouter } from "expo-router";
import { StyleSheet, Text, type TextStyle } from "react-native";
import { colors } from "../../theme";
import { parseTextForLinks } from "../linking";

export function LinkedText({ text, style }: { text: string; style?: TextStyle }) {
  const router = useRouter();
  const segments = parseTextForLinks(text);

  if (segments.length === 1 && segments[0]?.type === "text") {
    return <Text style={style}>{text}</Text>;
  }

  return (
    <Text style={style}>
      {segments.map((seg, i) => {
        if (seg.type === "link") {
          return (
            <Text
              key={i}
              style={styles.link}
              onPress={() =>
                router.push({
                  pathname: "/compendium/[kind]/[id]",
                  params: { kind: seg.entryKind!, id: seg.entryId! },
                })
              }
            >
              {seg.content}
            </Text>
          );
        }
        return seg.content;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    color: colors.link,
    textDecorationLine: "underline",
  },
});
