class GameServer {
    round
    phase
    deck
    lastBetType
    lastBetChips
    totalBetChips
    isTenDie
    player1
    player2

    constructor(id1, id2) {
        this.player1 = {
            id: id1,
            myTurn: true,
            chips: 20,
        }
        this.player2 = {
            id: id2,
            myTurn: true,
            chips: 20,
        }
        this.deck = [];
        for (let i = 1; i <= 20; i++)
            this.deck.push(i);
        this.round = this.phase = 1;
        this.lastBetType = '';
        this.lastBetChips = 0;
        this.totalBetChips = 0;
        this.isTenDie = false;
    }

    ToggleTurn() {
        this.player1.myTurn = !this.player1.myTurn;
        this.player2.myTurn = !this.player2.myTurn;
    }
}

module.exports = GameServer;