import { Archetype } from "./actions.enums";

export const MAX_QUESTIONS = 8;

export const ARCHETYPE_TOTAL_IMAGES = 800;

export const QUESTIONS = [
  // Question A
  {
    question: "Bitcoin just pumped to its ATH! What's your play?",
    options: [
      "Take some profits fam, gotta secure those gains.",
      "Diamond hands on this. We're going higher - $100K.",
      "Let me check the charts and see where this candle is gonna close.",
      "Nothing to see, getting back to work.",
    ],
  },
  // Question B
  {
    question:
      "What do you do when u see a token starting to gain traction on CT?",
    options: [
      "Check who is shilling it, at least I'm in good company if the token goes to shit.",
      "Throw in a big chunk of your SOL - either i make it or I'm heading back to McD.",
      `Mid-curve it. Wait and see if it pumps, "I'll stack up some when it dips."`,
      `Jump on the hype, if it takes off, will QT the original tweet "Here, I gave u a 50x."`,
    ],
  },
  // Question C
  {
    question: "Your favorite way to contribute to the crypto community?",
    options: [
      "Trade Alpha, dropping the next 100x ticker.",
      "Helping to boost the dApp DAU and TVL (aka airdrop farming).",
      "Memes and threads all day.",
      "BD and growth, let's connect on TG!",
    ],
  },
  // Question D
  {
    question: "What's your risk tolerance in crypto investments?",
    options: [
      "Legendary - I bought BAYC when it was 100 ETH.",
      "High – full port memes,high risk high reward.",
      "Moderate – balanced portfolio with some risky assets.",
      "Low – prefer to invest in majors / top 50 coins.",
    ],
  },
  // Question E
  {
    question: "What interests you more in crypto?",
    options: [
      "I'm all about the tech and the next big innovation using blockchain.",
      "It's the chance to get to 7 figs and be financially free.",
      "The vibe, the community, the culture.",
      "Nothing, I just have a gambling addiction bro.",
    ],
  },
  // Question F
  {
    question: "How do you handle negative news in crypto?",
    options: [
      "Dump it all before it tanks to zero.",
      "Nah, just gonna diamond hand this one.",
      "Time to review my portfolio and sell the weak performers.",
      "Just gonna post a meme on Twitter, I've been through worse times.",
    ],
  },
  // Question G
  {
    question: "How did u get into crypto?",
    options: [
      "I thought that the tech was cool.",
      "A friend brought me in.",
      "Financial guru ads on Youtube.",
      "The immutable jpegs.",
    ],
  },
  // Question H
  {
    question: "How often do you open to check the price?",
    options: [
      "Multiple times a day.",
      "Once a day.",
      "A few times a week.",
      "Only when there's a breaking news.",
    ],
  },
];

/**
 *Maps each question (A-H) to a set of scoring rules for determining the archetype.
 *Each question is associated with an object where:
 * - The keys are the possible answer options (0-3)
 * - The values are the archetype scores corresponding to each answer option.
 */
export const ARCHETYPE_SCORES: { [key: string]: Archetype }[] = [
  // question A
  {
    0: Archetype.Pistachio,
    1: Archetype.Almond,
    2: Archetype.Walnut,
    3: Archetype.Macademia,
  },
  // question B
  {
    0: Archetype.Pecan,
    1: Archetype.Cashew,
    2: Archetype.Walnut,
    3: Archetype.Pistachio,
  },
  // question C
  {
    0: Archetype.Pecan,
    1: Archetype.Pistachio,
    2: Archetype.Cashew,
    3: Archetype.Macademia,
  },
  // question D
  {
    0: Archetype.Chestnut,
    1: Archetype.Cashew,
    2: Archetype.Walnut,
    3: Archetype.Almond,
  },
  // question E
  {
    0: Archetype.Hazelnut,
    1: Archetype.Pecan,
    2: Archetype.Chestnut,
    3: Archetype.Cashew,
  },
  // question F
  {
    0: Archetype.Macademia,
    1: Archetype.Almond,
    2: Archetype.Walnut,
    3: Archetype.Cashew,
  },
  // question G
  {
    0: Archetype.Hazelnut,
    1: Archetype.Pistachio,
    2: Archetype.Almond,
    3: Archetype.Chestnut,
  },
  // question H
  {
    0: Archetype.Pecan,
    1: Archetype.Walnut,
    2: Archetype.Macademia,
    3: Archetype.Hazelnut,
  },
];
