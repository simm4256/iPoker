import { useDispatch } from 'react-redux';
import { changePage } from '../store/page';
import './Main.scss'

function Main(props) {
    const dispatch = useDispatch();
    return (
        <div className='container'>
            <p className='title pt-5 pb-5'>i Poker</p>
            <div className='button-matching' onClick={() => props.socket.emit("request : matching")}>
                매칭
            </div>
            <div className='button-guide' onClick={() => dispatch(changePage('guidePage'))}>
                게임 설명
            </div>
        </div>
    )
}

export default Main