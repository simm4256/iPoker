import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux';
import './Main.scss'

function Main(props) {

    return (
        <div className='container'>
            <p className='title pt-5 pb-5'>i Poker</p>
            <div className='button-matching' onClick={() => Click(props.socket)}>
                매칭
            </div>
        </div>
    )
}

function Click(socket) {
    socket.emit("request : matching");
}

export default Main