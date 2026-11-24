import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
p='src/avatar.js'; s=open(p,encoding='utf-8').read()
def R(a,b):
    global s; assert s.count(a)==1,a[:70]; s=s.replace(a,b)
R("""<g class="armL"><path d="M62 150 q-26 6 -30 28" fill="none" stroke="'+s[0]+'" stroke-width="18" stroke-linecap="round"/><path d="M62 150 q-26 6 -30 28" fill="none" stroke="'+ink+'" stroke-width="22" stroke-linecap="round" opacity=".0"/></g>""",
  """<g class="armL"><path d="M66 150 q-26 6 -30 28" fill="none" stroke="'+ink+'" stroke-width="24" stroke-linecap="round"/><path d="M66 150 q-26 6 -30 28" fill="none" stroke="'+s[0]+'" stroke-width="16" stroke-linecap="round"/></g>""")
R("""<g class="armR"><path d="M138 150 q26 6 30 28" fill="none" stroke="'+s[0]+'" stroke-width="18" stroke-linecap="round"/></g>""",
  """<g class="armR"><path d="M134 150 q26 6 30 28" fill="none" stroke="'+ink+'" stroke-width="24" stroke-linecap="round"/><path d="M134 150 q26 6 30 28" fill="none" stroke="'+s[0]+'" stroke-width="16" stroke-linecap="round"/></g>""")
R("""<g class="tears"><path d="M78 118 q-4 14 0 20 q4 -6 0 -20z" fill="#8fd0ff"/><path d="M122 118 q-4 14 0 20 q4 -6 0 -20z" fill="#8fd0ff"/></g>""",
  """<g class="tears"><path d="M76 98 q-6 14 0 20 q6 -6 0 -20z" fill="#8fd0ff" stroke="#fff" stroke-width="2"/><path d="M124 98 q-6 14 0 20 q6 -6 0 -20z" fill="#8fd0ff" stroke="#fff" stroke-width="2"/><g transform="translate(0 -6)"><path d="M70 -2 q-14 0 -14 -12 q0 -12 14 -12 q4 -12 20 -12 q14 0 20 10 q16 -2 18 12 q2 14 -14 14z" fill="#c9d3e0" stroke="'+ink+'" stroke-width="3"/><path d="M78 4 l-4 8 M98 4 l-4 8 M118 4 l-4 8" stroke="#7cb8f0" stroke-width="4" stroke-linecap="round"/></g></g>""")
R('<g class="dizzy"><path d="M70 22 q10 -10 20 0 q10 10 20 0 q10 -10 20 0"','<g class="dizzy"><path d="M64 -6 q10 -10 20 0 q10 10 20 0 q10 -10 20 0 q10 10 20 0"')
R('<g class="crown"><path d="M72 18 l10 -16 l9 12 l9 -16 l9 16 l9 -12 l10 16z"','<g class="crown"><path d="M70 2 l10 -18 l10 12 l10 -18 l10 18 l10 -12 l10 18z"')
W='<g transform="translate(10 24) scale(.9)">'
R('viewBox="0 0 200 240" aria-hidden="true"><g class="whole">','viewBox="0 0 200 240" aria-hidden="true">'+W+'<g class="whole">')
R("""</g></g>'+fx+'</svg>'; }
  return""","""</g></g>'+fx+'</g></svg>'; }
  return""")
R('viewBox="0 0 200 240" aria-hidden="true"><defs>','viewBox="0 0 200 240" aria-hidden="true">'+W+'<defs>')
R("""stroke-width="3"/></g></g>'+fx+'</svg>'; }""","""stroke-width="3"/></g></g>'+fx+'</g></svg>'; }""")
R('.replace(/<g class="fx">[\\s\\S]*$/,"");','.replace(/<g class="fx">[\\s\\S]*$/,"</g>");')
R('AE.zoom=1.4;','AE.zoom=1.7;')
open(p,'w',encoding='utf-8').write(s)
p='src/shell.html'; s=open(p,encoding='utf-8').read()
R('<span id="track"><span id="dots"></span><span id="tbud" class="tbud" data-buddy></span></span>','<span id="track"><span id="dots"></span></span>')
R('.av.pose-cheer .armL,.av.pose-crown .armL{transform:rotate(115deg)}\n.av.pose-cheer .armR,.av.pose-crown .armR{transform:rotate(-115deg)}',
  '.av.pose-cheer .armL{transform:rotate(115deg)}\n.av.pose-cheer .armR{transform:rotate(-115deg)}\n.av.pose-crown .armR{transform:rotate(-150deg)}.av.pose-crown .armL{transform:rotate(-25deg)}\n.av.pose-crown .head{transform:rotate(-6deg)}')
R('.av.pose-sad .tears,.av.pose-sad .sweat{opacity:1}','.av.pose-sad .tears{opacity:1}')
R('.note{font-size:14px;color:var(--soft);margin:0}','.note{font-size:14px;color:var(--soft);margin:0;word-break:keep-all}')
open(p,'w',encoding='utf-8').write(s)
p='src/flow.js'; s=open(p,encoding='utf-8').read()
R('document.body.dataset.view=id; window.scrollTo(0,0);','document.body.dataset.view=id; window.scrollTo(0,0); var fx=$("fx"); if(fx) fx.innerHTML="";')
open(p,'w',encoding='utf-8').write(s)
print("ok")
