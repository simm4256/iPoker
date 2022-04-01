
class Client {
    number
    id
    enemyId
    isGaming = false
    gameInfo
    constructor(number, id) {
        this.number = number;
        this.id = id;
        this.gameInfo = {
            chips: 20,
            round: 1,
            initTurn: true,
            main: true,
            card: -1,
        }
    }
}

module.exports = Client;