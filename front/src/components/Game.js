import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { changeInfoValue } from "../store/gameInfo";
import './Game.scss'

export default function Game(props) {
    const gameInfo = useSelector((state) => state.gameInfo);
    const socket = props.socket;
    const isMain = gameInfo.main;
    useEffect(() => {
        isMain && socket.emit('request : round start');
    }, []);
    return (
        <div className="game-container">
            {gameInfo.visibleResult ?
                <div className="result">
                    {`You ` + (gameInfo.chips > 0 ? `Win!` : `Lose...`)}
                    <br />
                    <h5>{gameInfo.chips > 900 ? `enemy Disconnected` : ``}</h5>
                </div>
                :
                <>
                    <EnemyMain gameInfo={gameInfo}></EnemyMain>
                    <SpeechBubble gameInfo={gameInfo}></SpeechBubble>
                    <Board gameInfo={gameInfo}></Board>
                    <Play gameInfo={gameInfo} socket={socket}></Play>
                </>
            }

        </div>
    )
}

function EnemyMain(props) {
    const gameInfo = props.gameInfo;
    return (
        <div className="enemy-main">
            <img src={`images/person_${gameInfo.phase < -1 ? `nocard_` : ``}white.png`} alt="" />
            <div className="enemy-main-card">
                {(gameInfo.enemyCard === -1 || gameInfo.phase < -1) ? '' : gameInfo.enemyCard}
            </div>
        </div>
    )
}
function SpeechBubble(props) {
    const gameInfo = props.gameInfo;
    return (
        <div className="enemy-status">
            <img className="enemy-speech" src="images/speech_white.png" alt="" />
            <div className="enemy-text">
                {gameInfo.enemyText}
            </div>
            <img className="enemy-chip chip" src="images/chip_white.png" alt="" />
            <div className="enemy-chip-text chip-text">
                x{gameInfo.enemyChips}
            </div>
            {gameInfo.enemyChipsChangeVisible ?
                <div className="enemy-chip-change chip-text" style={{ 'color': Number(gameInfo.enemyChipsChange) > 0 ? '#ff2281' : '#3baaff' }}>
                    {gameInfo.enemyChipsChange}
                </div>
                : null
            }
        </div>
    )
}
function Board(props) {
    const gameInfo = props.gameInfo;
    return (
        <div className="board-main">
            <div className="board-line">

            </div>
            <div className="board-deck">
                <img src="images/deck_white.png" alt="" />
            </div>
            <div className="board-round">
                Round {gameInfo.round}
            </div>
            {gameInfo.visibleDeckShffle ?
                <div className="board-shuffle">
                    덱 초기화 중...
                </div>
                : null}
            {gameInfo.visibleTenDie ?
                <div className="board-tenDie">
                    {!gameInfo.myTurn ? `Enemy TenDie!!` : `You TenDie..`}
                </div>
                : null}

            {gameInfo.phase > -1
                ?
                (gameInfo.myTurn
                    ?
                    <div className="board-myArrow arrow blink">
                        ▾
                    </div>
                    :
                    <div className="board-enemyArrow arrow blink">
                        ▾
                    </div>)
                : null
            }
            {!gameInfo.visibleDeckShffle ?
                <>
                    <img className="board-myChip chip" src="images/chip_white.png" alt="" />
                    <div className="board-myChip-text chip-text">
                        x{gameInfo.chips}
                    </div>
                    {
                        gameInfo.chipsChangeVisible ?
                            <div className="board-myChip-change chip-text" style={{ 'color': Number(gameInfo.chipsChange) > 0 ? '#ff2281' : '#3baaff' }}>
                                {gameInfo.chipsChange}
                            </div>
                            : null
                    }
                </>
                : null
            }
            {gameInfo.phase > -3 && (!gameInfo.visibleDeckShffle) ?
                <>
                    <img className="board-chips chip" src="images/chip_white.png" alt="" />
                    <div className="board-chips-text chip-text">
                        x{gameInfo.bettedChips}
                    </div>

                    {
                        gameInfo.boardChipsChangeVisible ?
                            <div className="board-chip-change chip-text" style={{ 'color': Number(gameInfo.boardChipsChange) > 0 ? '#ff2281' : '#3baaff' }}>
                                {gameInfo.boardChipsChange}
                            </div>
                            : null
                    }
                </>
                : null
            }
            {gameInfo.phase < -1 && (!gameInfo.visibleDeckShffle)
                ?
                <>
                    <div className="board-enemyCard card">
                        <div className="cardText">
                            {gameInfo.enemyCard}
                        </div>
                    </div>
                    <div className="board-myCard card">
                        <div className="cardText">
                            {gameInfo.card}
                        </div>
                    </div>
                </>
                : null}

        </div>
    )
}
function Play(props) {
    const gameInfo = props.gameInfo;
    const socket = props.socket;
    const playUI = {
        default: <PlayInit socket={socket} gameInfo={gameInfo}></PlayInit>,
        raise: <PlayRaise socket={socket} gameInfo={gameInfo}></PlayRaise>,
        text: <PlayText gameInfo={gameInfo}></PlayText>
    }
    return (
        < div className="play-main" >
            {playUI[gameInfo.visiblePlay]}
        </div >
    )
}

function PlayInit(props) {
    const dispatch = useDispatch();
    const socket = props.socket;
    const gameInfo = props.gameInfo;
    return (
        <>
            <div className="buttonDiv">
                {
                    (gameInfo.chips - gameInfo.lastRaisedChips > 0) && gameInfo.enemyChips > 0 && !gameInfo.isChecked ?
                        <button className="button" onClick={(() => { dispatch(changeInfoValue(['visiblePlay', 'raise'])) })}>
                            레이즈
                        </button>
                        : null
                }
            </div>
            <div className="buttonDiv" >
                <button className="button" onClick={(() => {
                    socket.emit(`request : ${gameInfo.phase === 1 ? 'check' : 'call'}`);
                    if (gameInfo.phase === 1)
                        dispatch(changeInfoValue(['isChecked', true]));
                })}>
                    {gameInfo.phase === 1 ? '체크' : `콜(${gameInfo.lastRaisedChips})`}
                </button>
            </div>
            <div className="buttonDiv" >
                <button className='button' onClick={(() => {
                    socket.emit(`request : die`);
                })}>
                    다이
                </button>
            </div>
        </>
    )
}

function PlayRaise(props) {
    const dispatch = useDispatch();
    const socket = props.socket;
    const gameInfo = props.gameInfo;
    let [raiseText, raiseTextChanger] = useState('');
    let [bottomColor, bottomColorChanger] = useState('#aaaaaa');
    let [bottomVisible, bottomVisibleChanger] = useState('maximum');
    const bottomTexts = {
        maximum: `최대 ${Math.min(gameInfo.chips - gameInfo.lastRaisedChips, gameInfo.enemyChips)}개`,
        minimum: `최소 1개`,
        nan: `숫자를 입력하세요`,
        nai: `정수를 입력하세요`,
        nothing: '',
    }
    return (
        <>
            <div className="play-left button" onClick={(() => { dispatch(changeInfoValue(['visiblePlay', 'default'])) })}>
                취소
            </div>
            <div className="play-middle">
                {gameInfo.lastRaisedChips !== 0 ? <div className="play-middle-top-text">{gameInfo.lastRaisedChips}개 받고</div> : null}
                <input type="number" placeholder="칩 입력" onChange={(e) => { raiseTextChanger(e.target.value) }} />
                <div className="play-middle-bottom-text" style={{ 'color': bottomColor }}>
                    {bottomTexts[bottomVisible]}
                </div>
            </div>
            <div className="play-right button" onClick={() => {
                if (isNaN(Number(raiseText))) {
                    bottomColorChanger('red');
                    bottomVisibleChanger('nan');
                }
                else if (Number.isInteger(Number(raiseText)) !== true) {
                    bottomColorChanger('red');
                    bottomVisibleChanger('nai');
                }
                else if (Number(raiseText) > (Math.min(gameInfo.chips - gameInfo.lastRaisedChips, gameInfo.enemyChips))) {
                    bottomColorChanger('red');
                    bottomVisibleChanger('maximum');
                }
                else if (Number(raiseText) < 1) {
                    bottomColorChanger('red');
                    bottomVisibleChanger('minimum');
                }
                else {
                    bottomColorChanger('#aaaaaa');
                    bottomVisibleChanger('nothing');
                    socket.emit('request : raise', Number(raiseText));
                }
            }}>
                확인
            </div>

        </>
    )
}

function PlayText(props) {
    const gameInfo = props.gameInfo;
    return (
        <>
            <div className="play-text">
                <div>{gameInfo.text}</div>
            </div>
        </>
    )
}