# 녹음 목소리 만들기 (네이버 클라우드 CLOVA Voice)
#
# 준비
#   1. 네이버 클라우드 콘솔에서 CLOVA Voice 이용 신청 → Application 등록 → Client ID / Client Secret 확인
#   2. 아래 파일을 직접 만들어 두 줄을 적어요 (이 대화에 붙여 넣지 마세요)
#        ~/.config/goyu/clova.env
#          CLOVA_ID=발급받은 Client ID
#          CLOVA_SECRET=발급받은 Client Secret
#
# 쓰는 법
#   python3 tools/voice_gen.py samples     # 후보 목소리 들어 보기 (audio/_samples/)
#   python3 tools/voice_gen.py all         # data/phrases.json 전체를 만들기 (이미 만든 건 건너뜀)
#   python3 tools/voice_gen.py mac         # (시험용) 맥 기본 음성으로 흉내만 내기
#
# 목소리는 tools/voice_cfg.json 에서 바꿔요. 키는 화면에 찍지 않아요.
import concurrent.futures as cf, hashlib, json, os, subprocess, sys, tempfile, time, urllib.parse, urllib.request

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(R, "audio")
CFG = json.load(open(os.path.join(R, "tools", "voice_cfg.json"), encoding="utf-8"))
URL = "https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts"


def key():
    p = os.path.expanduser("~/.config/goyu/clova.env"); kv = {}
    if not os.path.exists(p): sys.exit("~/.config/goyu/clova.env 파일이 없어요. 위 준비 2번을 먼저 해 주세요.")
    for line in open(p, encoding="utf-8"):
        if "=" in line: k, v = line.strip().split("=", 1); kv[k.strip()] = v.strip()
    if not kv.get("CLOVA_ID") or not kv.get("CLOVA_SECRET"): sys.exit("clova.env 에 CLOVA_ID, CLOVA_SECRET 두 줄이 있어야 해요.")
    return kv["CLOVA_ID"], kv["CLOVA_SECRET"]


def h(text): return hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]


def speakable(t):
    # 화면용 기호는 빼고 읽기 좋게
    return t.replace("『", "").replace("』", "").replace("~?", "?").replace("~!", "!").replace("~", "")


def squeeze(raw, out):
    # 용량 줄이기: 모노 40kbps, 앞뒤 무음 살짝 정리
    with tempfile.NamedTemporaryFile(suffix=".audio", delete=False) as f: f.write(raw); src = f.name
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.08",
                    "-ac", "1", "-ar", "24000", "-b:a", "40k", out], check=True)
    os.unlink(src)


def clova(cred, speaker, text, opt):
    body = {"speaker": speaker, "text": speakable(text), "format": "mp3", "volume": 0, "speed": opt.get("speed", 0), "pitch": opt.get("pitch", 0), "alpha": opt.get("alpha", 0)}
    if "emotion" in opt: body["emotion"] = opt["emotion"]
    req = urllib.request.Request(URL, data=urllib.parse.urlencode(body).encode(), headers={"X-NCP-APIGW-API-KEY-ID": cred[0], "X-NCP-APIGW-API-KEY": cred[1], "Content-Type": "application/x-www-form-urlencoded"})
    for i in range(5):
        try:
            with urllib.request.urlopen(req, timeout=30) as r: return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and i < 4: time.sleep(2 ** i); continue
            raise SystemExit("CLOVA 오류 %d: %s" % (e.code, e.read().decode("utf-8", "replace")[:200]))


def mac(voice, text, opt):
    with tempfile.TemporaryDirectory() as d:
        a = os.path.join(d, "a.aiff"); subprocess.run(["say", "-v", voice, "-o", a, speakable(text)], check=True)
        return open(a, "rb").read()


def jobs():
    ph = json.load(open(os.path.join(R, "data", "phrases.json"), encoding="utf-8"))
    out = []
    for kind, v in CFG["ko"].items(): out += [("ko-" + kind, v, t) for t in ph["ko"]]
    for lang, v in CFG["lang"].items(): out += [(lang, v, t) for t in ph[lang]]
    return ph, out


def run(mode):
    if mode == "samples":
        cred = key(); d = os.path.join(AUD, "_samples"); os.makedirs(d, exist_ok=True)
        lines = {"ko": "우와, 성공! 진짜 멋진데? 사과 3개와 2개를 합치면 모두 몇 개야?", "en": "Apple! Great job!", "ja": "りんご! すごいね!", "zh": "苹果! 真棒!"}
        for lang, sp in CFG["samples"].items():
            for s in sp:
                squeeze(clova(cred, s, lines[lang], CFG["opt"].get(lang, {})), os.path.join(d, "%s_%s.mp3" % (lang, s)))
                print("만듦:", "audio/_samples/%s_%s.mp3" % (lang, s))
        return
    ph, js = jobs(); cred = key() if mode == "all" else None
    todo = [(f, v, t) for f, v, t in js if not os.path.exists(os.path.join(AUD, f, h(t) + ".mp3"))]
    print("만들 파일 %d개 / 전체 %d개, 글자 %d자" % (len(todo), len(js), sum(len(t) for _, _, t in todo)))

    def one(j):
        f, v, t = j; os.makedirs(os.path.join(AUD, f), exist_ok=True)
        lang = "ko" if f.startswith("ko-") else f
        raw = clova(cred, v["speaker"], t, v) if mode == "all" else mac(CFG["mac"][lang], t, {})
        squeeze(raw, os.path.join(AUD, f, h(t) + ".mp3"))
    with cf.ThreadPoolExecutor(4 if mode == "all" else 8) as ex:
        for i, _ in enumerate(ex.map(one, todo)):
            if i % 100 == 99: print(i + 1, "개 완료")
    idx = {"v": 1, "kinds": list(CFG["ko"].keys()), "ko": {t: h(t) for t in ph["ko"]}, "l": {lang: {t: h(t) for t in ph[lang]} for lang in CFG["lang"]}}
    json.dump(idx, open(os.path.join(AUD, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("audio/index.json 저장")


if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else "samples")
