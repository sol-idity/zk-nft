export type AnswerKey = `answer${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export type UserAnswerRecord = {
  account: string;
  sessionId: string;
  answer1: number | null;
  answer2: number | null;
  answer3: number | null;
  answer4: number | null;
  answer5: number | null;
  answer6: number | null;
  answer7: number | null;
  answer8: number | null;
  result: number | null;
  createdAt: Date;
  updatedAt: Date;
};
