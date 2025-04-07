import { Suit, Rank, Phase } from "./game_constants";

export type Button = {
  isDown: boolean;
  isChanged: boolean;
};

export type Input = {
  mouseX: number;
  mouseY: number;
  action: Button;
};

export type Card = {
  suit: Suit;
  rank: Rank;
};

export type Attack = {
  attack: Card;
  defense: Card | null;
};

export type GameState = {
  gameOver: boolean;
  deck: Card[];
  phase: Phase;
  trump: Suit;
  playerOneHand: Card[];
  playerTwoHand: Card[];
  bout: Attack[];
  currentAttack: Attack | null;
  selectedCards: Set<Rank>;
  events: Discard[];

  //UI
  idCounter: number;
  hotItem: number;
  activeItem: number;
};

export type Discard = {
  card: Card;
  hand: Card[];
};
