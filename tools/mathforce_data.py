# -*- coding: utf-8 -*-
# 수학특공대(아람) 본책 42권: 제목·개념은 공식 상품 페이지 목차 기준. 놀이는 개념에 맞춰 새로 짠 것(책 내용·그림은 쓰지 않음).
import json, os
DOM = {"수":"#5b3fa8","도":"#2f9e8f","규":"#e0679a","측":"#ef8a2f","융":"#3b82f6"}
D = "책에서 가장 재미있었던 장면을 그려 볼까?"
B = [
 ("초코의 생일 파티","생활 속 수","수",[("count",{"icon":"cupcake","nums":[1,2,3,4,5]}),("tapcount",{"icon":"balloon","nums":[2,3,4,5]}),("findnum",{"upto":10}),("coins",{}),("draw",{"prompt":"생일 케이크에 초를 그려 볼까? 몇 살이야?"})]),
 ("양말들이 뒤죽박죽!","짝 찾기","규",[("pairs",{}),("sort",{"set":"tidy"}),("pairs",{}),("pattern",{}),("draw",{"prompt":"내 양말에 무늬를 그려 볼까?"})]),
 ("점, 선, 면 같이 놀자!","점·선·면","도",[("dots",{"shape":"star"}),("dots",{"shape":"house"}),("shapefind",{}),("sort",{"set":"shape"}),("draw",{"prompt":"점과 선으로 그림을 그려 볼까?"})]),
 ("노랑, 검정, 노랑, 검정 그다음엔?","규칙 찾기","규",[("pattern",{"rows":[["star","moon"],["apple","banana"],["circle","square"]]}),("pattern",{"rows":[["fish","duck","duck"],["sun","sun","moon"],["dog","cat","cat"]]}),("pattern",{}),("pairs",{}),("draw",{"prompt":"노랑 검정 노랑 검정, 줄무늬를 그려 볼까?"})]),
 ("개미 열 마리가 영차! 영차!","10까지 세기","수",[("count",{"icon":"bean","nums":[6,7,8,9,10]}),("tapcount",{"icon":"strawberry","nums":[6,7,8,9,10]}),("numorder",{"maxn":10}),("frame",{"size":10,"nums":[6,7,8,9,10]}),("findnum",{"upto":10})]),
 ("슈퍼 소방차 출동!","순서수","수",[("ordinal",{"icon":"car"}),("order",{"animals":["bear","cat","rabbit","dog"],"kind":"train"}),("order",{"animals":["rabbit","dog","duck"],"kind":"podium"}),("routine",{}),("numorder",{"maxn":10})]),
 ("상어 가족의 신나는 하루","많다·적다·같다","수",[("compare",{"icon":"fish"}),("compare",{"icon":"fish","icon2":"shell"}),("graph",{"items":["fish","shell","duck"]}),("makeN",{"n":5,"icon":"fish"}),("frame",{"size":5,"nums":[2,3,4,5]})]),
 ("기리기리 이야기","길이 재기","측",[("length",{}),("measure",{}),("measure",{}),("size",{"icon":"tree"}),("draw",{"prompt":"아주아주 긴 목을 가진 동물을 그려 볼까?"})]),
 ("다람쥐들의 소풍","더하기","수",[("add",{"icon":"cookie","probs":[[2,1],[3,2],[1,4]]}),("add",{"icon":"apple","probs":[[2,2],[3,3],[4,1]]}),("frame",{"size":5,"nums":[3,4,5]}),("makeN",{"n":5,"icon":"cookie"}),("count",{"icon":"apple","nums":[3,4,5]})]),
 ("정리 대장 척척 문어","색깔별로 나누기","규",[("sort",{"set":"color"}),("sort",{"set":"tidy"}),("sort",{"set":"color"}),("shapefind",{}),("draw",{"prompt":"빨강, 노랑, 초록 물건을 하나씩 그려 볼까?"})]),
 ("점이 떨어졌어!","빼기","수",[("subtract",{"icon":"balloon","probs":[[5,2],[4,1],[6,3]],"verb":"날아갔어요"}),("subtract",{"icon":"mosquito","probs":[[5,1],[6,2],[4,2]],"verb":"날아갔어요"}),("compare",{"icon":"bean"}),("makeN",{"n":5,"icon":"bean"}),("count",{"icon":"bean","nums":[1,2,3,4,5]})]),
 ("도와줘요, 원맨!","원","도",[("shapefind",{}),("sort",{"set":"shape"}),("puzzle",{"target":"caterpillar"}),("puzzle",{"target":"flower"}),("draw",{"prompt":"동그라미로 얼굴을 그려 볼까?"})]),
 ("내일은 똥이 나오겠지?","어제·오늘·내일","측",[("routine",{}),("routine",{"steps":[["seed","씨앗"],["sprout","싹"],["flower","꽃"]]}),("calendar",{}),("clock",{}),("draw",{"prompt":"내일 하고 싶은 일을 그려 볼까?"})]),
 ("호랑이 붕어빵","나누기","수",[("share",{"total":4,"people":2,"icon":"fish"}),("share",{"total":6,"people":3,"icon":"cookie"}),("share",{"total":8,"people":2,"icon":"strawberry"}),("add",{"icon":"fish"}),("count",{"icon":"fish","nums":[2,4,6]})]),
 ("양쪽이 똑같은 나라로!","대칭","도",[("pairs",{}),("puzzle",{"target":"house"}),("puzzle",{"target":"rocket"}),("shapefind",{}),("draw",{"prompt":"양쪽이 똑같은 나비를 그려 볼까?"})]),
 ("슈퍼 당근 대회","들이와 무게","측",[("heavy",{}),("heavy",{}),("size",{"icon":"carrot"}),("length",{}),("draw",{"prompt":"제일 큰 당근을 그려 볼까?"})]),
 ("코뿔소의 꿈","10씩 묶어 세기","수",[("findnum",{"upto":30}),("frame",{"size":10,"nums":[7,8,9,10]}),("makeN",{"n":10,"icon":"star"}),("numorder",{"maxn":10}),("count",{"icon":"star","nums":[8,9,10]})]),
 ("신나는 다각형 파티","다각형","도",[("shapefind",{}),("puzzle",{"target":"mix"}),("dots",{"shape":"star"}),("sort",{"set":"shape"}),("draw",{"prompt":"세모와 네모로 집을 그려 볼까?"})]),
 ("수박 아사삭","두 수 더하기","수",[("add",{"icon":"melon","probs":[[3,2],[4,3],[5,2]]}),("add",{"icon":"cherry","probs":[[2,3],[4,4],[3,5]]}),("makeN",{"n":10,"icon":"melon"}),("frame",{"size":10,"nums":[5,6,7]}),("coins",{})]),
 ("사람이 되고 싶어요!","규칙 예측하기","규",[("pattern",{}),("pattern",{"rows":[["circle","triangle","square"],["apple","ball","ball"],["star","heart","heart"]]}),("pattern",{}),("numorder",{"maxn":10}),("draw",{"prompt":"나만의 규칙으로 목걸이를 그려 볼까?"})]),
 ("지혜로운 백설 공주","넓이 재기","측",[("area",{}),("area",{}),("size",{"icon":"apple"}),("compare",{"icon":"apple"}),("draw",{"prompt":"넓은 들판을 그려 볼까?"})]),
 ("비비의 꿀 모으기 대작전","2씩, 3씩 묶어 세기","수",[("share",{"total":6,"people":2,"icon":"flower"}),("share",{"total":6,"people":3,"icon":"flower"}),("count",{"icon":"flower","nums":[4,6,8]}),("add",{"icon":"flower","probs":[[2,2],[3,3],[2,4]]}),("frame",{"size":10,"nums":[4,6,8]})]),
 ("모양 가게로 오세요!","동그라미·세모·네모","도",[("shapefind",{}),("sort",{"set":"shape"}),("bingo",{"kind":"shape"}),("puzzle",{"target":"house"}),("draw",{"prompt":"동그라미, 세모, 네모로 가게를 그려 볼까?"})]),
 ("원숭이 삼 형제와 숫자 0","숫자 0","수",[("frame",{"size":5,"nums":[0,1,2,3]}),("subtract",{"icon":"banana","probs":[[3,3],[2,2],[4,4]],"verb":"먹었어요"}),("count",{"icon":"banana","nums":[1,2,3]}),("compare",{"icon":"banana"}),("findnum",{"upto":10})]),
 ("신데렐라와 호박 마차","여러 기준으로 나누기","규",[("sort",{"set":"fruit"}),("sort",{"set":"roll"}),("sort",{"set":"season"}),("pairs",{}),("draw",{"prompt":"호박 마차를 그려 볼까?"})]),
 ("오늘은 아이스바 오는 날","달력 보기","측",[("calendar",{}),("calendar",{}),("routine",{}),("findnum",{"upto":30}),("clock",{})]),
 ("사자! 머리 끈 사자!","돈 계산하기","수",[("coins",{}),("coins",{"items":[["toy",3],["book",4],["cupcake",2]]}),("coins",{"items":[["ball",5],["milk",2],["umbrella",4]]}),("add",{"icon":"coin"}),("count",{"icon":"coin","nums":[3,4,5,6]})]),
 ("방귀 공주와 요리사","비교하기","측",[("compare",{"icon":"cupcake"}),("size",{"icon":"cupcake"}),("length",{}),("heavy",{}),("area",{})]),
 ("나눠 먹고! 같이 먹고!","가르기·모으기","수",[("makeN",{"n":5,"icon":"cookie"}),("makeN",{"n":10,"icon":"cookie"}),("add",{"icon":"cookie"}),("share",{"total":6,"people":2,"icon":"cookie"}),("frame",{"size":10,"nums":[5,6,7,8]})]),
 ("다조아 선생님의 똑똑 그래프","그래프","규",[("graph",{}),("graph",{"items":["dog","cat","rabbit","bear"]}),("compare",{"icon":"star"}),("count",{"icon":"star","nums":[3,4,5,6]}),("sort",{"set":"fruit"})]),
 ("장난감은 어디에?","두 사물의 위치","도",[("position",{}),("position",{}),("inout",{}),("leftright",{}),("draw",{"prompt":"책상 위에 있는 장난감을 그려 볼까?"})]),
 ("브레멘 음악대, 짐을 빼 줘!","두 수 빼기","수",[("subtract",{"icon":"box","probs":[[6,2],[7,3],[8,4]],"verb":"치웠어요"}),("subtract",{"icon":"ball","probs":[[5,3],[7,2],[9,4]],"verb":"치웠어요"}),("makeN",{"n":10,"icon":"box"}),("compare",{"icon":"box"}),("count",{"icon":"box","nums":[4,5,6,7]})]),
 ("장난감 병원에서 생긴 일","입체 도형","도",[("sort",{"set":"roll"}),("shapefind",{}),("puzzle",{"target":"rocket"}),("dots",{"shape":"rocket"}),("draw",{"prompt":"상자 모양 로봇을 그려 볼까?"})]),
 ("엄마, 지금 몇 시예요?","시계 보기","측",[("clock",{}),("clock",{}),("clock",{}),("routine",{}),("numorder",{"maxn":10})]),
 ("바늘 요정들의 시합","빠르기","측",[("order",{"animals":["rabbit","dog","duck"],"kind":"podium"}),("length",{}),("compare",{"icon":"star"}),("routine",{}),("draw",{"prompt":"가장 빠른 탈것을 그려 볼까?"})]),
 ("꼬미를 찾아라!","위치와 방향","도",[("maze",{"start":"cat","goal":"house"}),("leftright",{}),("position",{}),("maze",{"start":"dog","goal":"bowl"}),("draw",{"prompt":"우리 집 가는 길을 그려 볼까?"})]),
 ("일곱 조각을 지켜 줘!","칠교","도",[("puzzle",{"target":"mix"}),("puzzle",{"target":"fish"}),("puzzle",{"target":"rocket"}),("shapefind",{}),("draw",{"prompt":"세모 조각으로 동물을 만들어 그려 볼까?"})]),
 ("교통 박물관에 간 시골 쥐와 도시 쥐","수학과 탈것","융",[("count",{"icon":"car","nums":[3,4,5,6]}),("order",{"animals":["bear","cat","rabbit","dog"],"kind":"train"}),("compare",{"icon":"car"}),("maze",{"start":"car","goal":"house"}),("draw",{"prompt":"타 보고 싶은 탈것을 그려 볼까?"})]),
 ("수수께끼를 좋아하는 늑대","수학과 자연","융",[("pattern",{"rows":[["leaf","flower"],["sun","moon"],["tree","tree","flower"]]}),("count",{"icon":"leaf","nums":[3,5,7]}),("size",{"icon":"tree"}),("sort",{"set":"tree"}),("draw",{"prompt":"숲속 수수께끼를 그림으로 내 볼까?"})]),
 ("도둑을 잡은 덩크","수학과 언어","융",[("bingo",{"kind":"num"}),("findnum",{"upto":20}),("ordinal",{"icon":"star"}),("numorder",{"maxn":10}),("draw",{"prompt":"도둑을 잡는 장면을 그려 볼까?"})]),
 ("램프의 요정! 소원을 들어줘!","수학과 예술","융",[("pattern",{}),("puzzle",{"target":"flower"}),("dots",{"shape":"heart"}),("shapefind",{}),("draw",{"prompt":"요정에게 빌고 싶은 소원을 그려 볼까?"})]),
 ("헨젤과 그레텔, 마법의 방을 탈출하라!","수학과 암호","융",[("maze",{"start":"chick","goal":"house"}),("numorder",{"maxn":10}),("pattern",{}),("bingo",{"kind":"num"}),("dots",{"shape":"house"})]),
]
NAME = {"count":"몇 개일까?","tapcount":"눌러서 색칠하기","trace":"손가락으로 따라 쓰기","dots":"점 잇기","order":"순서대로 태우기","ordinal":"몇째일까?",
 "numorder":"숫자 차례로 누르기","routine":"무엇을 먼저 할까?","compare":"어느 쪽이 많을까?","bingo":"빙고","draw":"그림 그리기","frame":"칸 채우기","add":"모두 몇 개?",
 "hidden":"숨은 그림 찾기","subtract":"남은 건 몇 개?","makeN":"몇 개 더 있어야 할까?","findnum":"숫자 찾기","calendar":"달력 놀이","coins":"동전 가게",
 "share":"똑같이 나누기","maze":"미로 탈출","inout":"안과 밖","shapefind":"모양 찾기","puzzle":"모양 퍼즐","sort":"같은 것끼리","pairs":"양말 짝 찾기",
 "position":"어디에 놓을까?","leftright":"왼쪽 오른쪽","size":"크기 순서","measure":"콩으로 재기","length":"긴 줄 짧은 줄","area":"넓은 쪽 찾기",
 "heavy":"무거워요 가벼워요","clock":"시계 보기","pattern":"다음엔 뭐가 올까?","graph":"그래프 읽기"}
def build():
    books = []
    for i, (t, concept, dom, lv) in enumerate(B, 1):
        assert len(lv) == 5, t
        seen = {}; L = []
        for g, p in lv:
            assert g in NAME, g
            n = NAME[g]; seen[n] = seen.get(n, 0) + 1
            if seen[n] > 1: n += " %d" % seen[n]
            L.append({"g": g, "p": p, "name": n})
        books.append({"no": i, "title": t, "concept": concept, "color": DOM[dom], "levels": L})
    return books
if __name__ == "__main__":
    R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json.dump(build(), open(os.path.join(R, "data/mathforce.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print("ok", len(B))
