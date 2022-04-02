
class Client {
    number
    id
    enemyId
    isGaming = false
    gameInfo
    lastTime
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
        this.lastTime = {
            chipsChange: 9999999999999,
            enemyChipsChange: 9999999999999,
            boardChipsChange: 9999999999999,
        }
    }
}

module.exports = Client;