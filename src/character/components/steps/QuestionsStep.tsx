import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii } from "../../../theme";
import { classes } from "../../srdOptions";
import type { StepProps } from "./types";

// Shared body for the Background (Step 6) and Connections (Step 9) steps: render the class's three
// questions as optional free-text prompts, upserting answers keyed by question id. Both are
// optional ("answer any").
export function QuestionsStep({ character, update, kind }: StepProps & { kind: "background" | "connections" }) {
  const def = character.definition;
  const classEntry = classes.find((c) => c.id === def.classId);
  if (!classEntry) {
    return <Text style={styles.hint}>Choose a class to see its {kind} questions.</Text>;
  }

  const questions = kind === "background" ? classEntry.backgroundQuestions : classEntry.connectionQuestions;
  const answers = def[kind].answers;
  const answerFor = (questionId: string) => answers.find((a) => a.questionId === questionId)?.answer ?? "";
  const answeredCount = questions.filter((question) => answerFor(question.id).trim().length > 0).length;

  const setAnswer = (questionId: string, prompt: string, text: string) =>
    update((c) => {
      const list = c.definition[kind].answers;
      const existing = list.find((a) => a.questionId === questionId);
      if (existing) {
        existing.answer = text;
      } else {
        list.push({ id: questionId, questionId, prompt, answer: text });
      }
    });

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{answeredCount}/3 answered</Text>
        <Text style={styles.hint}>
          {kind === "background"
            ? "Answer any that fit your character. This step is optional and can be skipped for now."
            : "Use these prompts at the table if they help. This step is optional and can be skipped for now."}
        </Text>
      </View>
      {questions.map((question) => (
        <View key={question.id} style={[styles.field, answerFor(question.id).trim().length > 0 && styles.fieldAnswered]}>
          <Text style={styles.question}>{question.text}</Text>
          <Text style={styles.answerState}>{answerFor(question.id).trim().length > 0 ? "Answered" : "Optional"}</Text>
          <TextInput
            style={styles.input}
            value={answerFor(question.id)}
            multiline
            placeholder="Write your answer…"
            placeholderTextColor={colors.placeholder}
            onChangeText={(text) => setAnswer(question.id, question.text, text)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  hint: { color: colors.textSecondary, fontSize: 14 },
  summaryCard: { gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: radii.card, backgroundColor: colors.cardBackground, padding: 14 },
  summaryTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: "800" },
  field: { gap: 8, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radii.card, padding: 12 },
  fieldAnswered: { borderColor: colors.accent, backgroundColor: colors.highlightBackground },
  question: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  answerState: { color: colors.textTertiary, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 76,
    textAlignVertical: "top",
  },
});
