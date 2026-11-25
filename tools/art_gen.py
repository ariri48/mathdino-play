# 놀이 그림 만들기 (로컬 ComfyUI · Qwen-Image-Edit-2511 + Lightning 4step)
# 사용: ~/ComfyUI/.venv/bin/python tools/art_gen.py <jobs.json> [--only a,b] [--seeds N]
# jobs: [{"key":"apple","prompt":"...","refs":["mathdino/ref_apple.png"],"w":768,"h":768}]
import json, os, random, sys, time, urllib.parse, urllib.request, uuid
HOST = "http://127.0.0.1:8188"
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STYLE = (" Cute children's picture-book illustration, soft 3D clay plush-toy style, rounded chunky shapes, pastel colors,"
         " gentle soft lighting, a single object centered with generous margin, isolated on a plain pure white background,"
         " no shadow on the floor. No text, no letters, no numbers, no logo, no watermark.")
NEG = "text, letters, watermark, logo, multiple objects, cropped, border, frame, scary, realistic photo, dark"

def build(job, seed):
    refs = job.get("refs", [])[:3]
    g = {"unet": {"class_type": "UNETLoader", "inputs": {"unet_name": "qwen_image_edit_2511_fp8mixed.safetensors", "weight_dtype": "default"}},
         "clip": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image", "device": "default"}},
         "vae": {"class_type": "VAELoader", "inputs": {"vae_name": "qwen_image_vae.safetensors"}},
         "msa": {"class_type": "ModelSamplingAuraFlow", "inputs": {"model": ["unet", 0], "shift": 3.1}},
         "cfgn": {"class_type": "CFGNorm", "inputs": {"model": ["msa", 0], "strength": 1}},
         "lora": {"class_type": "LoraLoaderModelOnly", "inputs": {"model": ["cfgn", 0], "lora_name": "Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors", "strength_model": 1}},
         "lat": {"class_type": "EmptySD3LatentImage", "inputs": {"width": job.get("w", 768), "height": job.get("h", 768), "batch_size": 1}}}
    imgs = {}
    for i, r in enumerate(refs, 1):
        g[f"load{i}"] = {"class_type": "LoadImage", "inputs": {"image": r}}
        g[f"scale{i}"] = {"class_type": "FluxKontextImageScale", "inputs": {"image": [f"load{i}", 0]}}
        imgs[f"image{i}"] = [f"scale{i}", 0]
    style = job.get("style", STYLE)
    for name, text in (("pos", job["prompt"] + style), ("neg", NEG)):
        g[name] = {"class_type": "TextEncodeQwenImageEditPlus", "inputs": {"clip": ["clip", 0], "vae": ["vae", 0], "prompt": text, **imgs}}
        g[name + "m"] = {"class_type": "FluxKontextMultiReferenceLatentMethod", "inputs": {"conditioning": [name, 0], "reference_latents_method": "index_timestep_zero"}}
    g["ks"] = {"class_type": "KSampler", "inputs": {"model": ["lora", 0], "positive": ["posm", 0], "negative": ["negm", 0], "latent_image": ["lat", 0],
               "seed": seed, "steps": 4, "cfg": 1, "sampler_name": "euler", "scheduler": "simple", "denoise": 1}}
    g["dec"] = {"class_type": "VAEDecode", "inputs": {"samples": ["ks", 0], "vae": ["vae", 0]}}
    g["save"] = {"class_type": "SaveImage", "inputs": {"images": ["dec", 0], "filename_prefix": "mathdino/" + job["key"]}}
    return g

def post(path, data):
    return json.load(urllib.request.urlopen(urllib.request.Request(HOST + path, data=json.dumps(data).encode(), headers={"Content-Type": "application/json"})))

def run(job, seed):
    pid = post("/prompt", {"prompt": build(job, seed), "client_id": str(uuid.uuid4())})["prompt_id"]; t0 = time.time()
    while True:
        time.sleep(2); h = json.load(urllib.request.urlopen(f"{HOST}/history/{pid}"))
        if pid in h:
            st = h[pid].get("status", {})
            if st.get("status_str") == "error": raise RuntimeError(json.dumps(st.get("messages"))[:600])
            outs = [im for o in h[pid]["outputs"].values() for im in o.get("images", [])]
            if outs:
                im = outs[0]; q = urllib.parse.urlencode({"filename": im["filename"], "subfolder": im["subfolder"], "type": im["type"]})
                dest = os.path.join(R, "art", "raw", f"{job['key']}_s{seed}.png"); urllib.request.urlretrieve(f"{HOST}/view?{q}", dest)
                return dest, time.time() - t0

if __name__ == "__main__":
    jobs = json.load(open(sys.argv[1])); only = set(sys.argv[sys.argv.index("--only") + 1].split(",")) if "--only" in sys.argv else None
    seeds = int(sys.argv[sys.argv.index("--seeds") + 1]) if "--seeds" in sys.argv else 1
    for job in jobs:
        if only and job["key"] not in only: continue
        if job.get("skip_done") and any(f.startswith(job["key"] + "_s") for f in os.listdir(os.path.join(R, "art", "raw"))): continue
        base = job.get("seed", random.randint(1, 10**9))
        for k in range(seeds):
            try: dest, sec = run(job, base + k); print(f"{job['key']} {sec:.0f}s", flush=True)
            except Exception as e: print("FAIL", job["key"], e, flush=True)
