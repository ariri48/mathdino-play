# 만든 그림 다듬기: 배경 지우기 → 여백 자르기 → 정사각형 256px webp (art/<key>.webp)
# 사용: ~/.venvs/rembg/bin/python tools/art_post.py [key ...]   (art/pick.json 에 고른 파일이 있으면 그걸 씀)
import glob, json, os, sys
from PIL import Image
from rembg import new_session, remove
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); A = os.path.join(R, "art")
pick = json.load(open(os.path.join(A, "pick.json"))) if os.path.exists(os.path.join(A, "pick.json")) else {}
sess = new_session("isnet-general-use")
keys = sys.argv[1:] or sorted({os.path.basename(f).rsplit("_s", 1)[0] for f in glob.glob(os.path.join(A, "raw", "*.png"))})
for k in keys:
    src = pick.get(k) or sorted(glob.glob(os.path.join(A, "raw", k + "_s*.png")), key=os.path.getmtime)[0]
    src = src if os.path.isabs(src) else os.path.join(A, "raw", src)
    im = remove(Image.open(src).convert("RGB"), session=sess, post_process_mask=True)
    a = im.getchannel("A").point(lambda v: 0 if v < 24 else v); im.putalpha(a)
    bb = a.getbbox(); im = im.crop(bb); w, h = im.size; s = int(max(w, h) * 1.08)
    sq = Image.new("RGBA", (s, s), (0, 0, 0, 0)); sq.paste(im, ((s - w) // 2, (s - h) // 2)); sq = sq.resize((256, 256), Image.LANCZOS)
    sq.save(os.path.join(A, k + ".webp"), "WEBP", quality=86, method=6); print(k, os.path.getsize(os.path.join(A, k + ".webp")) // 1024, "KB")
