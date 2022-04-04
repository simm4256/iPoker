import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { changePage } from '../store/page';
import './Guide.scss';

export default function Guide(props) {
    const dispatch = useDispatch();
    let [slide, slideChanger] = useState(1);
    const maxslide = 23;
    const texts = [
        [`iPoker는 `, `인디언 포커`, `로\n알려져 있는 2인용 게임입니다.`],
        [`게임이 시작되면 각 플레이어는\n20개의 `, `칩`, `을 얻습니다.`],
        [`게임 플레이를 통해 상대방의\n`, `칩`, ` 20개를 모두 따면 승리합니다.`],
        [`게임은 여러 `, `라운드`, `로\n구성되어 있습니다.`],
        [`라운드`, `가 시작되면 각 플레이어는 `, `덱`, `에서 카드 한 장을 받습니다.`],
        [`덱`, `은 1~10 카드 `, `2세트`, `로\n구성되어 있습니다.`],
        [`(10n번째 라운드가 끝날 때마다)`, `\n20장의 카드를 모두 사용하면\n`, `새로운 `, `덱`, `으로 교체합니다.`],
        [`이후 받은 카드를 이마에 붙여\n상대방에게만 보여줍니다.\n본인은 볼 수 없습니다.`],
        [`각 플레이어는 참가비로\n`, `칩`, ` 1개씩을 냅니다.`],
        [`이후 `, `선 플레이어`, `부터\n`, `플레이`, `를 합니다.`],
        [`라운드마다 `, `선 플레이어`, `가 교체됩니다.`],
        [`플레이는 `, `레이즈`, ` `, `체크`, ` `, `콜`, ` `, `다이`, `\n 4가지 플레이가 있습니다.`],
        [`레이즈`, `는 `, `보유한 `, `칩`, `을 \n추가로 베팅하는 플레이입니다.`],
        [`상대가 `, `레이즈`, `한 경우\n`, `레이즈`, `로 되받아칠 수 있습니다.\n\n이 때 상대의 레이즈 칩 수를 \n기본으로 하고, 추가 레이즈 칩을\n정할 수 있습니다.`],
        [`체크`, `는 칩을 지불하지 않고\n상대방에게 턴을 넘기는 플레이입니다.\n\n각 라운드가 시작될 때\n`, `선 플레이어`, `만 플레이 할 수 있습니다.`],
        [`체크`, `한 플레이어는 그 라운드에\n더 이상 `, `레이즈`, `할 수 없습니다.`],
        [`콜`, `은 라운드를 종료하는 플레이입니다.\n상대의 `, `레이즈`, ` 칩을 지불합니다.\n`, `(상대가 체크한 후의 콜은 칩을 지불하지 않습니다.)`],
        [`다이`, `는 라운드를 종료하는\n또다른 플레이입니다.`],
        [`다이`, `를 외치면 카드와 관계 없이\n해당 라운드에서 패배합니다.`],
        [`라운드가 종료되면\n서로의 카드를 오픈합니다.\n라운드가 `, `콜`, `로 끝났다면\n카드가 높은 플레이어가 승리하여\n베팅된 칩을 가져옵니다.`],
        [`다이`, `한 플레이어의 카드가 `, `10`, `인 경우를\n`, `TenDie`, `라 칭하며, 그 플레이어는\n추가로 5개의 칩을 더 지불합니다.`],
        [`지금 바로 `, `한 판`, ` 해보세요!`]
    ]
    const keywords = ['인디언 포커', '라운드', '덱', '2세트', '콜', '다이', '레이즈', '체크', '칩', '플레이', '선 플레이어', '10', 'TenDie', '한 판']
    const smallSentences = [`(10n번째 라운드가 끝날 때마다)`, `(상대가 체크한 후의 콜은 칩을 지불하지 않습니다.)`]
    return (
        <div className='guideAll'>
            <div className="guideBox">
                <div className="guide-top">
                    <span className='fs-13'>게임 설명</span>
                    <div className="guide-homeButton" onClick={() => { dispatch(changePage('mainPage')) }}>
                        <img src="images/back-button.png" alt="홈버튼" />
                    </div>
                </div>
                <div className="guide-body">
                    {slide < maxslide - 1 ?
                        <img src={`images/guide${slide < 19 ? slide : slide - 1}.png`} alt="" />
                        :
                        <div className='guide-end fs-20'>
                            iPoker
                        </div>}
                </div>
                <div className="guide-bottom fs-9">
                    {texts[slide - 1].map((txt, i) => {
                        if (keywords.includes(txt)) {
                            return <span key={i} style={{ 'color': 'yellow' }}>{txt}</span>
                        }
                        if (smallSentences.includes(txt)) {
                            return <span key={i} className="fs-7" style={{ 'opacity': '0.5' }}>{txt}</span>
                        }
                        return txt;
                    })}
                </div>
                {slide > 1 ?
                    <>
                        <div className="guide-leftArrow guideArrow fs-15">
                            ▾
                        </div>
                        <div className="guide-leftButton guideButton" onClick={() => { slideChanger(slide - 1) }}>
                        </div>
                    </>
                    : null
                }
                {slide < maxslide ?
                    <>
                        <div className="guide-rightArrow guideArrow fs-15">
                            ▾
                        </div>
                        <div className="guide-gotohome guideArrow fs-7">
                            {slide === maxslide - 1 ? `홈으로` : ''}
                        </div>
                        <div className="guide-rightButton guideButton" onClick={() => {
                            if (slide === maxslide - 1)
                                dispatch(changePage('mainPage'));
                            else
                                slideChanger(slide + 1);
                        }}>
                        </div>
                    </>
                    : null
                }
            </div>
        </div>
    )
}