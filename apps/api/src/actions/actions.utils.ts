import { answers } from "@zk-nft/schemas/answers.schema";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { ARCHETYPE_SCORES, MAX_QUESTIONS } from "./actions.constants";
import { and, eq } from "drizzle-orm";
import { AnswerKey, UserAnswerRecord } from "./actions.types";

export async function handlePrevAnswer({
  db,
  questionNumber,
  sessionId,
  prevAnswerNumber,
  account,
}: {
  db: DrizzleD1Database<Record<string, never>>;
  questionNumber: number;
  sessionId: string | undefined;
  prevAnswerNumber: number | null;
  account: string;
}) {
  if (!sessionId || !account) {
    throw new Error("Session ID and Account are required");
  }

  const newValue = {
    account,
    sessionId,
    [`answer${questionNumber - 1}`]: prevAnswerNumber,
  };

  let userAnswers = await db
    .insert(answers)
    .values(newValue)
    .onConflictDoUpdate({
      target: [answers.account, answers.sessionId],
      set: newValue,
    })
    .returning()
    .get();

  // if all questions are answered, determine archetype
  if (questionNumber === MAX_QUESTIONS + 1) {
    // Check if all answers exist for each question and validate
    let allAnswered = true;
    for (let i = 0; i < MAX_QUESTIONS; i++) {
      const answerKey = `answer${i + 1}` as AnswerKey;
      const answer = userAnswers[answerKey];

      if (
        answer !== null &&
        typeof answer === "number" &&
        answer >= 0 &&
        answer <= 3
      ) {
        continue;
      } else {
        allAnswered = false;
        break;
      }
    }

    if (!allAnswered)
      throw new Error(
        "Not all questions have been answered or some answers are invalid."
      );

    // determine archetype based on answers
    const result = determineArchetype(userAnswers as UserAnswerRecord);

    userAnswers = await db
      .update(answers)
      .set({
        result,
      })
      .where(
        and(eq(answers.account, account), eq(answers.sessionId, sessionId))
      )
      .returning()
      .get();
  }

  return userAnswers;
}

function determineArchetype(answers: UserAnswerRecord): number {
  let sum = 0;

  for (let i = 0; i < MAX_QUESTIONS; i++) {
    const answerKey = `answer${i + 1}` as AnswerKey;
    const answer = answers[answerKey]!;
    const questionArchetype = ARCHETYPE_SCORES[i][answer];
    sum += questionArchetype;
  }

  sum = Math.min(sum, 56); // maximum possible sum is 56

  return Math.floor(sum / 8);
}

export const generateNftId = (): number => {
  return Math.floor(Math.random() * 6399);
};
