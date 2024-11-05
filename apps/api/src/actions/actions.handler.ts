import {
  ACTION_QUESTION_IMAGE_BASE_URL,
  DEFAULT_ACTION_ICON,
} from "../common/constants";
import { getAppHono } from "../common/utils/get-app-hono.util";
import {
  createActionHeaders,
  type Action,
  type ActionGetResponse,
  type ActionPostRequest,
  type ActionPostResponse,
} from "@solana/actions";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { buildMintTx } from "../mint/mint.utils";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Bindings } from "../common/types/bindings";
import { zValidator } from "@hono/zod-validator";
import { z } from "@hono/zod-openapi";
import { nanoid } from "nanoid";
import { HTTPException } from "hono/http-exception";
import {
  ARCHETYPE_TOTAL_IMAGES,
  MAX_QUESTIONS,
  QUESTIONS,
} from "./actions.constants";
import { handlePrevAnswer } from "./actions.utils";
import { Buffer } from "buffer";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { checkMintEligibility } from "../mint/mint.middleware";
import { answers } from "@zk-nft/schemas/answers.schema";
import { isNotNull, count } from "drizzle-orm";

const DESCRIPTION = `Discover your hidden Archetype in just ${MAX_QUESTIONS} fun questions and unlock a personalized NFT that represents your true essence! Ready to dive in?`;

const app = getAppHono();

app.use((c, next) => {
  const headers = createActionHeaders({
    chainId: "mainnet",
    actionVersion: "2.2.1",
  });
  c.res.headers.set("X-Blockchain-Ids", headers["X-Blockchain-Ids"]);
  c.res.headers.set("X-Action-Version", headers["X-Action-Version"]);
  return next();
});

// app.get("/stats", async (c) => {
//   const db = c.get("db");

//   const minted = await db
//     .selectDistinct({
//       account: answers.account,
//     })
//     .from(answers)
//     .where(isNotNull(answers.result));
    
//   return c.json({
//     minted: minted?.length ?? 0,
//   });
// });

app.get("/", (c) => {
  const response: ActionGetResponse = {
    icon: DEFAULT_ACTION_ICON,
    label: `Start quiz!`,
    title: `What Archetype are you?`,
    description: DESCRIPTION,
    links: {
      actions: [
        {
          type: "post",
          label: `Start quiz!`,
          href: `/actions/question/1`,
        },
      ],
    },
  };

  return c.json(response);
});

app.post(
  "/question/submit",
  cloudflareRateLimiter<{
    Bindings: Bindings;
  }>({
    rateLimitBinding: (c) => c.env.MINT_RATE_LIMITER,
    keyGenerator: async (c) => {
      const { account } = (await c.req.json()) as ActionPostRequest;
      if (!account) {
        return c.req.header("cf-connecting-ip") ?? "";
      }
      return account;
    },
  }),
  checkMintEligibility,
  zValidator(
    "query",
    z.object({
      sessionId: z.string().length(21),
    })
  ),
  zValidator(
    "json",
    z.object({
      account: z.string(),
      data: z.object({
        prevAnswer: z.string().refine((prevAnswer) => {
          if (prevAnswer.length > 1) {
            return false;
          }

          const parsed = Number(prevAnswer);
          return !isNaN(parsed) && parsed >= 0 && parsed < 4;
        }),
      }),
    })
  ),
  async (c) => {
    const { sessionId } = c.req.valid("query");
    const prevAnswer = c.req.valid("json").data.prevAnswer;
    const prevAnswerNumber = Number(prevAnswer);

    if (!sessionId || prevAnswerNumber === null) {
      throw new HTTPException(400, {
        message: "Session ID and answer are required",
      });
    }

    // TODO: use "userAnswers" and check if all questions are answered + determine archetype inside handlePrevAnswer
    const userAnswers = await handlePrevAnswer({
      db: c.get("db"),
      questionNumber: MAX_QUESTIONS + 1,
      sessionId,
      prevAnswerNumber,
      account: c.req.valid("json")?.account,
    });

    // Get random image id based on the archetype (result)
    const archetype = userAnswers.result!;
    const imageId =
      Math.floor(Math.random() * ARCHETYPE_TOTAL_IMAGES) +
      archetype * ARCHETYPE_TOTAL_IMAGES;

    const account = c.req.valid("json").account;
    const updateAuthority = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(c.env.UPDATE_AUTHORITY_KEYPAIR))
    );

    // const nftId = generateNftId();
    const { base64EncodedTransaction } = await buildMintTx({
      recipient: account,
      rpc: c.get("rpc"),
      updateAuthority,
      nftId: imageId,
    });

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: base64EncodedTransaction,
      links: {
        next: {
          type: "post",
          href: `/actions/success?nftId=${imageId}`,
        },
      },
    };

    return c.json(response);
  }
);

app.post(
  "/question/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().refine(
        (id) => {
          if (id.length > 1) {
            return false;
          }
          const parsed = Number(id);
          return !isNaN(parsed) && parsed > 0 && parsed <= MAX_QUESTIONS;
        },
        {
          message: "id must be a positive integer between 1 and 8",
        }
      ),
    })
  ),
  zValidator(
    "query",
    z.object({
      sessionId: z.string().length(21).optional(),
    })
  ),
  zValidator(
    "json",
    z.object({
      account: z.string(),
      data: z
        .object({
          prevAnswer: z.string().refine((prevAnswer) => {
            if (prevAnswer.length > 1) {
              return false;
            }

            const parsed = Number(prevAnswer);
            return !isNaN(parsed) && parsed >= 0 && parsed < 4;
          }),
        })
        .optional(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const questionNumber = Number(id);
    const { sessionId } = c.req.valid("query");
    const prevAnswer = c.req.valid("json")?.data?.prevAnswer;
    const prevAnswerNumber =
      typeof prevAnswer === "string" ? Number(prevAnswer) : null;

    if (questionNumber > 1 && (!sessionId || prevAnswerNumber === null)) {
      throw new HTTPException(400, {
        message: "Session ID and answer are required",
      });
    }

    const account = c.req.valid("json")?.account;
    if (sessionId && prevAnswerNumber !== null) {
      await handlePrevAnswer({
        db: c.get("db"),
        questionNumber,
        sessionId,
        prevAnswerNumber,
        account,
      });
    }

    const shouldGenerateTx = c.req.header("origin") === "https://x.com";
    if (shouldGenerateTx) {
      const { blockhash } = await c.get("rpc").getLatestBlockhash("confirmed");
      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(account),
        instructions: [
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 1,
          }),
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 1000,
          }),
          new TransactionInstruction({
            keys: [
              {
                pubkey: new PublicKey(account),
                isSigner: true,
                isWritable: true,
              },
            ],
            data: bs58.decode("Proceed"),
            programId: new PublicKey(
              "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"
            ),
          }),
        ],
        recentBlockhash: blockhash,
      }).compileToV0Message();
      const tx = new VersionedTransaction(messageV0);

      const response: ActionPostResponse = {
        type: "transaction",
        transaction: Buffer.from(tx.serialize()).toString("base64"),
        links: {
          next: {
            type: "post",
            href: `/actions/question/chain/${questionNumber}?sessionId=${sessionId ?? nanoid(21)}`,
          },
        },
      };

      return c.json(response);
    } else {
      const response: ActionPostResponse = {
        type: "post",
        links: {
          next: {
            type: "post",
            href: `/actions/question/chain/${questionNumber}?sessionId=${sessionId ?? nanoid(21)}`,
          },
        },
      };

      return c.json(response);
    }
  }
);

app.post(
  "/question/chain/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().refine(
        (id) => {
          if (id.length > 1) {
            return false;
          }
          const parsed = Number(id);
          return !isNaN(parsed) && parsed > 0 && parsed <= MAX_QUESTIONS;
        },
        {
          message: "id must be a positive integer between 1 and 8",
        }
      ),
    })
  ),
  zValidator(
    "query",
    z.object({
      sessionId: z.string().length(21),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const questionNumber = Number(id);
    const { sessionId } = c.req.valid("query");

    const actionIcon = `${ACTION_QUESTION_IMAGE_BASE_URL}q${id}.png`;

    const response: Action = {
      type: "action",
      icon: actionIcon,
      title: `Question ${questionNumber} of ${MAX_QUESTIONS}`,
      description: DESCRIPTION,
      label: "",
      links: {
        actions: [
          {
            label:
              questionNumber === MAX_QUESTIONS
                ? "Unlock your NFT!"
                : "Next question",
            href:
              questionNumber === MAX_QUESTIONS
                ? `/actions/question/submit?sessionId=${sessionId}`
                : `/actions/question/${questionNumber + 1}?sessionId=${sessionId}`,
            type: "post",
            parameters: [
              {
                type: "radio",
                name: "prevAnswer",
                label: QUESTIONS[questionNumber - 1].question,
                options: QUESTIONS[questionNumber - 1].options.map(
                  (option, i) => ({
                    label: option,
                    value: "" + i,
                  })
                ),
              },
            ],
          },
        ],
      },
    };

    return c.json(response);
  }
);

app.post(
  "/success",
  zValidator("query", z.object({ nftId: z.string() })),
  async (c) => {
    const { nftId } = c.req.valid("query");

    const isUnfurledBlink = c.req.header("origin") === "https://x.com";

    if (!isUnfurledBlink) {
      const response: Action = {
        type: "action",
        icon: `https://quiz-result.tinys.pl?id=${nftId}`,
        title: "Your Archetype has been minted!",
        label: "",
        description: "You can view your zkNFTs at https://zk.tinys.pl",
        links: {
          actions: [
            {
              type: "external-link",
              label: "Tweet about it!",
              href: `/actions/link/tweet?id=${nftId}`,
            },
          ],
        },
      };

      return c.json(response);
    } else {
      const response = {
        type: "action",
        icon: `https://quiz-result.tinys.pl?id=${nftId}`,
        title: "Your Archetype has been minted!",
        label: "",
        description: `Tweet this to share your results: "${
          "GM fam! Just unlocked my degen archetype in @deeznuts_solana’s new zkNFT-powered personality test — and it’s calling me out HARD 💀 Think your nuts can survive the roast? Test yourself and let's see how well we match \n" +
          "https://quiz.tinys.pl?id=" +
          nftId
        }"`,
      };

      return c.json(response);
    }
  }
);

app.post(
  "/link/tweet",
  zValidator("query", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("query");

    return c.json({
      type: "external-link",
      externalLink: `https://x.com/intent/post?text=${encodeURIComponent(
        "GM fam! Just unlocked my degen archetype in @deeznuts_solana’s new zkNFT-powered personality test — and it’s calling me out HARD 💀 Think your nuts can survive the roast? Test yourself and let's see how well we match \n" +
          "https://quiz.tinys.pl?id=" +
          id
      )}`,
    } satisfies ActionPostResponse);
  }
);

export default app;
