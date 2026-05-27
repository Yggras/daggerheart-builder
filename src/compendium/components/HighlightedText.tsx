import { StyleSheet, Text, type TextStyle } from "react-native";
import { colors } from "../../theme";

export function HighlightedText({
  text,
  highlight,
  style,
}: {
  text: string;
  highlight: string;
  style?: TextStyle;
}) {
  if (!highlight) {
    return <Text style={style}>{text}</Text>;
  }

  const parts: { text: string; matched: boolean }[] = [];
  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerHighlight, cursor);
    if (matchIndex === -1) {
      parts.push({ text: text.slice(cursor), matched: false });
      break;
    }
    if (matchIndex > cursor) {
      parts.push({ text: text.slice(cursor, matchIndex), matched: false });
    }
    parts.push({ text: text.slice(matchIndex, matchIndex + highlight.length), matched: true });
    cursor = matchIndex + highlight.length;
  }

  return (
    <Text style={style}>
      {parts.map((part, i) =>
        part.matched ? (
          <Text key={i} style={styles.highlight}>
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: colors.highlightBackground,
    fontWeight: "700",
  },
});
