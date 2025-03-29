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

export type Rank = (typeof Rank)[keyof typeof Rank];

//size in pixels
export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 600;

export const CARD_WIDTH = 50;
export const CARD_HEIGHT = 70;
