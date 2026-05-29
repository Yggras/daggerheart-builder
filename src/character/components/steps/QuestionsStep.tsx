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
      <Text style={styles.hint}>
        {kind === "background"
          ? "Answer any that fit your character — all optional."
          : "Prompts to explore with the other players — all optional."}
      </Text>
      {questions.map((question) => (
        <View key={question.id} style={styles.field}>
          <Text style={styles.question}>{question.text}</Text>
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
  field: { gap: 8 },
  question: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", lineHeight: 21 },
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
