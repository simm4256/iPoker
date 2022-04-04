import React, { lazy, Suspense, useEffect } from 'react';
import './App.scss';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import Socket from './socket';
const Main = lazy(() => import('./components/Main'));
const Matching = lazy(() => import('./components/Matching'));
const Game = lazy(() => import('./components/Game'));
const Guide = lazy(() => import('./components/Guide'));


const serverIp = '13.124.211.209';
const serverPort = '8080';
const socket = io.connect(`${serverIp}:${serverPort}`, { transports: ['websocket'] });



function App() {
  const dispatch = useDispatch();
  let page = useSelector((state) => state.page.pageName);
  let pageUI = {
    mainPage: <Main socket={socket}></Main>,
    guidePage: <Guide socket={socket}></Guide>,
    matchingPage: <Matching></Matching>,
    gamePage: <Game socket={socket}></Game>,
  }

  useEffect(() => {
    Socket(socket, dispatch);
    return (() => {
      socket.close();
    });
  }, []);




  return (
    <div className="App">
      <div className='Main'>
        <Suspense fallback={<div>Loading...</div>}>
          {pageUI[page]}
        </Suspense>
      </div>
    </div >
  );
}

export default App;
