import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const answers = sqliteTable(
  "answers",
  {
    account: text("account"),
    sessionId: text("session_id"),
    answer1: integer("answer1"),
    answer2: integer("answer2"),
    answer3: integer("answer3"),
    answer4: integer("answer4"),
    answer5: integer("answer5"),
    answer6: integer("answer6"),
    answer7: integer("answer7"),
    answer8: integer("answer8"),
    result: integer("result"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.account, table.sessionId] }),
    resultIdx: index("result_idx").on(table.result),
  })
);
