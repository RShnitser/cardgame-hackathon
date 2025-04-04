//game constants
export const Suit = {
  HEARTS: 0,
  DIAMONDS: 1,
  SPADES: 2,
  CLUBS: 3,
} as const;

export type Suit = (typeof Suit)[keyof typeof Suit];

export const Rank = {
  RANK_6: 1,
  RANK_7: 2,
  RANK_8: 3,
  RANK_9: 4,
  RANK_10: 5,
  RANK_J: 6,
  RANK_Q: 7,
  RANK_K: 9,
  RANK_A: 10,
} as const;

export const Phase = {
  PHASE_P1_ATTACK: 1,
  PHASE_P1_DEFEND: 2,
  PHASE_P2_ATTACK: 3,
  PHASE_P2_DEFEND: 4,
} as const;

export type Phase = (typeof Phase)[keyof typeof Phase];

export type Rank = (typeof Rank)[keyof typeof Rank];

//size in pixels
export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 600;

export const CARD_WIDTH = 50;
export const CARD_HEIGHT = 70;

export const suitMap = new Map<Suit, string>([
  [Suit.CLUBS, "♣"],
  [Suit.HEARTS, "♥"],
  [Suit.DIAMONDS, "♦"],
  [Suit.SPADES, "♠"],
]);

export const rankMap = new Map<Rank, string>([
  [Rank.RANK_6, "6"],
  [Rank.RANK_7, "7"],
  [Rank.RANK_8, "8"],
  [Rank.RANK_9, "9"],
  [Rank.RANK_10, "10"],
  [Rank.RANK_J, "J"],
  [Rank.RANK_Q, "Q"],
  [Rank.RANK_K, "K"],
  [Rank.RANK_A, "A"],
]);

//export type EventType = (typeof EventType)[keyof typeof EventType];
