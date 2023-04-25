# 소개

### iPoker는 '인디언 포커'로 알려져 있는 2인용 게임을 <br> 실시간 웹 게임으로 구현한 개인 프로젝트입니다.



<br><br>
# Stacks
### server
* node.js
* sokcet.io
* (배포)AWS ec2

### client
* html5
* css3 (scss)
* React, redux-toolkit
* (배포) AWS s3



<br><br>
# 개발 일지

### 22.03.29 (개발시작)
* 메인페이지 디자인 및 구현
* 서버 설계
  * 실시간 게임이므로, 통신에 websocket 필요. 따라서 가장 인기있는 라이브러리 socket.io 사용
  * 유저의 정보를 저장하거나 게임 결과나 로그를 저장하려면 DB가 필요하지만 이 프로젝트에선 필요하지 않음
  * ```Q1(해결)``` : 유저가 2명이 아니라, 훨씬 많이 접속해서 매칭된 유저들끼리 게임을 진행하려면 어떻게 하지?
    * client의 정보를 저장하는 것은 socket.id를 이용하면 간단하게 가능
    * 하지만 두 클라이언트가 매칭되었을 때, 해당 게임의 정보는?
    * 게임의 정보까지 client 객체에 두는 것은 클린하지 못한 코드
    * 따라서 매칭이 성사되었을 때 game 객체의 생성이 필요
  * ```Q2(해결)``` : game 객체는 두 유저가 공유하는 정보이므로 하나만 생성해야 하는데, 두 client가 한 game에 접근하려면?
    * 매칭이 성사되면 둘 중 한 유저를 main으로 두고, 클라이언트에서 보내는 요청은 main 유저만 보낼 수 있도록 설계
    * 요청은 main유저로부터 오지만 요청의 결과는 두 플레이어에게 보내야 함

### 22.03.30
* 매칭 시스템 구현
* 게임화면 UI 디자인 및 구현

### 22.03.31 ~ 22.04.01
* 게임 로직 구현
  * socket으로 주고받은 데이터의 업데이트를 모든 컴포넌트가 주고받으려면?
    * state를 사용해 props 계승으로만 처리하는것도 가능하지만 props가 길어질 것 같은 예감이 듦
    * 따라서 redux를 사용
    * redux로 개발 거의 끝마칠 즈음, 구글에서 redux-toolkit 이라는 라이브러리 발견. redux 공식 사이트에서도 권장한다는 말에 곧바로 채용
  * redux-toolkit 
    * index.js의 redux 보일러플레이트가 사라진다 : 너무좋다
    * store, reducer를 외부에서 관리한다 : 너무너무좋다 
* 게임 정보를 서버에서만 갖고있으면 생기는 문제점
  * 현재 게임 정보(칩 수, 현재 라운드, 상대 행동 등)를 서버에서만 관리하다 보니 골치아픈점이 발생
  * ```Q3(미해결)``` : 클라이언트에서도 게임 정보가 변화함에 따라 다양한 상호작용이 일어나는데, 이 게임 정보를 socket으로 받아올 때만 업데이트 하기엔 불필요한 socket 통신이 너무 많아짐
    * 결국 클라이언트에서도 게임 정보를 redux로 다루기로 결정
    * 문제는, 동일한 데이터가 서버와 클라이언트에서 모두 다루다 보니 데이터의 일관성을 유지하기가 매우 힘들어짐
    * 양쪽의 데이터가 맞지 않아 발생하는 버그가 많아지고, 이런 버그가 발생하면 데이터 흐름 추적을 서버와 클라이언트 양 쪽에서 하다보니 시간이 오래 걸림
    * 유지보수를 생각한다면 몇 개의 socket통신이 추가되더라도 게임 데이터 자체는 서버에서 관리하는 것이 맞다고 생각
  
### 22.04.02
* 칩 개수가 변경될 때마다 변동사항을 2초간 표시하는 기능 추가
  * 처음엔 클라이언트에서 칩 개수 변경이 일어날 때 변동 state를 업데이트하고, setTimeout으로 2초 후 변동 state가 보이지 않도록 설정
  * ```Q4(해결)``` : 칩 변경 후 2초가 되기 전에 유저의 행동으로 인해 칩 변경 이벤트가 또 발생하거나, 재렌더링으로 인해 변경 state가 바로 사라지거나 하는 다양한 버그 발생
    * 모든 컴포넌트 재렌더링 상황에 대해 칩 변경 이벤트에 대한 예외코드를 작성하려 했으나 근본적인 해결책이 아님을 깨달음
    * 칩 변동 이벤트는 서버에서 관리해야 한다고 결정 : 다음과 같이 구현함
    * 칩 변동이 발생하면 클라이언트는 서버에 칩 변동이 발생한 시간을 보냄
    * 서버는 0.1초마다 클라이언트의 가장 최근 칩 변동 시간과 현재시간을 비교하여, 2초가 되는 순간 클라이언트에 칩 변동 state를 끄라는 명령을 보냄

### 22.04.03
* 게임 가이드 추가
  * 아예 이 게임을 처음 접한 사람도 쉽게 이해하려면 어떤 내용이 필요하고, 어떤 방식으로 전달해야하는 지 고민
  * UX에 대한 깊은 고민을 하게 되는 시간이었음
  * ```Q5(미해결)``` : 가이드 내용으로 많은 이미지들을 만들어 넣다 보니 이미지 용량이 프로젝트 규모에 비해 과하게 커짐
    * 이미지로 가이드를 제작하는 것은 생산성은 높지만 유저가 다운받아야 할 용량이 과하게 커지는 경향이 있음
    * 대안으로는 게임화면을 불러와 css 애니메이션을 이용해 UI를 설명하는 방법이 있음

### 22.04.04
* AWS에서 배포
  * 서버는 ec2에서 가동
  * 클라이언트는 빌드한 폴더를 s3에 올려 s3로 접속

### 22.04.11 ~ 22.04.12
* 레이즈 칩 입력 부분 변경
  * HTML5 Meter로 변경함으로써 모바일 환경 UX 상승
  * 레이즈 문구를 화면 가운데로 올림 (기존 위치는 모바일에서 터치할 때 손에 가려짐)
  
### 23.04.25
* AWS free tier 만료로 인한 ec2 서버 종료

<br><br>
# TODO

* 게임 진행 과정 (특히 라운드 종료 시 정산하는 부분)에 애니메이션을 줘서 유저가 정확히 어떤 상황인지 직관적으로 이해할 수 있도록 하기
* ```Q3``` : 게임 정보 변경은 서버에서만 관리하고, 클라이언트는 서버에서 받은 정보를 출력만 하는 형식으로 바꾸기
* 서버 코드 리팩토링하기. (특히 소켓통신 분리하기)
* 각 소켓 통신과 dispatch에 대해 테스트 코드 작성하기
