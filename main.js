const SUIT_HEARTS = 1;
const SUIT_DIAMONDS = 2;
const SUIT_SPADES = 3;
const SUIT_CLUBS = 4;

const RANK_6 = 1;
const RANK_7 = 2;
const RANK_8 = 3;
const RANK_9 = 4;
const RANK_10 = 5;
const RANK_J = 6;
const RANK_Q = 7;
const RANK_K = 9;
const RANK_A = 10;

function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
}
