import bpy, glob, os
import numpy as np
R = '/Users/sindremarken/Downloads/mian_pose/'
src = sorted(glob.glob(R + 'png/pose_*.png'))
os.makedirs(R + 'webp', exist_ok=True); os.makedirs(R + 'webp_720', exist_ok=True)
sc = bpy.context.scene; vs = sc.view_settings; old = (vs.view_transform, vs.look, vs.exposure)
vs.view_transform = 'Standard'; vs.look = 'None'; vs.exposure = 0
s = sc.render.image_settings; s.file_format = 'WEBP'; s.color_mode = 'RGBA'
picks = list(range(0, 150, 10)) + [149]; tiles = {}
TW, TH = 160, 200
for i, f in enumerate(src):
    img = bpy.data.images.load(f)
    s.quality = 82; img.save_render(R + 'webp/pose_%03d.webp' % (i + 1), scene=sc)
    img.scale(720, 900); s.quality = 75; img.save_render(R + 'webp_720/pose_%03d.webp' % (i + 1), scene=sc)
    if i in picks:
        img.scale(TW, TH); tiles[i] = np.array(img.pixels[:], dtype=np.float32).reshape(TH, TW, 4)
    bpy.data.images.remove(img)
vs.view_transform, vs.look, vs.exposure = old
s.file_format = 'PNG'
sheet = np.zeros((TH * 4, TW * 4, 4), dtype=np.float32); sheet[..., :3] = 0.35; sheet[..., 3] = 1
for k, i in enumerate(picks):
    r, c = k // 4, k % 4; t = tiles[i]; a = t[..., 3:4]; y0 = (3 - r) * TH
    sheet[y0:y0 + TH, c * TW:(c + 1) * TW, :3] = t[..., :3] * a + 0.35 * (1 - a)
cs = bpy.data.images.get('kontakt')
if cs: bpy.data.images.remove(cs)
cs = bpy.data.images.new('kontakt', TW * 4, TH * 4, alpha=True)
cs.pixels[:] = sheet.ravel(); cs.filepath_raw = R + 'kontaktark.png'; cs.file_format = 'PNG'; cs.save()
win = bpy.context.window
for a in win.screen.areas:
    if a.type == 'IMAGE_EDITOR':
        a.spaces.active.image = cs
        with bpy.context.temp_override(window=win, area=a, region=[r for r in a.regions if r.type == 'WINDOW'][0]):
            bpy.ops.image.view_all(fit_view=True)
bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1)
mb = lambda d: round(sum(os.path.getsize(x) for x in glob.glob(R + d + '/*.webp')) / 1e6, 2)
result = {'n': len(src), 'full_MB': mb('webp'), 'mobile_MB': mb('webp_720')}
