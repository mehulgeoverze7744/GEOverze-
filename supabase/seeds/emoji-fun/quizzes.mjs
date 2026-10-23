import { bankA } from "./bank-a.mjs";
import { bankB } from "./bank-b.mjs";
import { bankC } from "./bank-c.mjs";
import { bankD } from "./bank-d.mjs";
import { bankE } from "./bank-e.mjs";

/** Fifty emoji-rebus quizzes, easy 1–30, medium 31–45, hard 46–50. */
export const QUIZZES = [...bankA, ...bankB, ...bankC, ...bankD, ...bankE];

export const PROMPTS = {
  country: "Which country do these clues spell?",
  capital: "Which capital do these clues spell?",
  city: "Which city do these clues spell?",
  landmark: "Which landmark do these clues spell?",
  feature: "Which geographic feature do these clues spell?",
  word: "Which geography word do these clues spell?",
  state: "Which state or region do these clues spell?",
  ocean: "Which body of water do these clues spell?",
  continent: "Which continent do these clues spell?",
  island: "Which island do these clues spell?",
};

export const REWARDS = {
  Easy: { minutes: 6, xp: 240, credits: 60 },
  Medium: { minutes: 7, xp: 320, credits: 80 },
  Hard: { minutes: 9, xp: 400, credits: 100 },
};
