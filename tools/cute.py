# 아이콘에 표정(눈·볼터치·웃는 입)과 반짝 하이라이트를 붙여 귀엽게
import re
FACE = {"apple":(50,62,1.4),"star":(50,58,1.1),"heart":(50,46,1.3),"balloon":(50,38,1.2),"cupcake":(50,40,.9),"sun":(50,50,1.05),
        "egg":(50,72,1.0),"triangle":(50,74,1.3),"square":(50,52,1.5),"circle":(50,52,1.5),"rect":(50,52,1.2),"tree":(50,64,.8),
        "flower":(50,50,.6),"bean":(46,60,1.0),"box":(30,68,.9)}
CHERRY = [(33,76,.6),(57,76,.6)]
SHINE = {"apple":(34,42,7,10),"balloon":(36,24,6,10),"circle":(32,34,7,11),"heart":(30,30,6,9),"ball":(34,30,6,9),"cherry":(28,78,3,5),"grape":(40,40,3,5),"egg":(36,40,5,9),"strawberry":(36,40,4,7)}
def face(cx,cy,k):
    e=6.5*k
    return (f'<g class="kf" stroke="none">'
            f'<ellipse cx="{cx-e:.1f}" cy="{cy:.1f}" rx="{2.8*k:.1f}" ry="{3.6*k:.1f}" fill="#3b2f2a"/><ellipse cx="{cx+e:.1f}" cy="{cy:.1f}" rx="{2.8*k:.1f}" ry="{3.6*k:.1f}" fill="#3b2f2a"/>'
            f'<circle cx="{cx-e+1*k:.1f}" cy="{cy-1.3*k:.1f}" r="{1.1*k:.1f}" fill="#fff"/><circle cx="{cx+e+1*k:.1f}" cy="{cy-1.3*k:.1f}" r="{1.1*k:.1f}" fill="#fff"/>'
            f'<ellipse cx="{cx-12.5*k:.1f}" cy="{cy+5*k:.1f}" rx="{4*k:.1f}" ry="{2.5*k:.1f}" fill="#ff7f9e" opacity=".55"/><ellipse cx="{cx+12.5*k:.1f}" cy="{cy+5*k:.1f}" rx="{4*k:.1f}" ry="{2.5*k:.1f}" fill="#ff7f9e" opacity=".55"/>'
            f'<path d="M{cx-4*k:.1f} {cy+4.5*k:.1f} Q{cx:.1f} {cy+9*k:.1f} {cx+4*k:.1f} {cy+4.5*k:.1f}" fill="none" stroke="#3b2f2a" stroke-width="{2.6*k:.1f}" stroke-linecap="round"/></g>')
def cute(defs):
    def rep(m):
        k, body = m.group(1), m.group(2)
        add = ""
        if k in SHINE: x,y,rx,ry = SHINE[k]; add += f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#fff" opacity=".6" stroke="none" transform="rotate(-25 {x} {y})"/>'
        if k in FACE: add += face(*FACE[k])
        if k == "cherry": add += "".join(face(*c) for c in CHERRY)
        if not add: return m.group(0)
        return m.group(0).replace("</g></symbol>", add + "</g></symbol>")
    return re.sub(r'<symbol id="g-([a-z]+)"[^>]*>(.*?)</symbol>', rep, defs, flags=re.S)
