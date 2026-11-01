import bpy, numpy as np
# render a list of (frame or (shape value, rotation)) states into one strip shown in the image editor
sc = bpy.context.scene
R = '/Users/sindremarken/Downloads/mian_pose/'
states = PREVIEW_STATES  # injected by caller
pct, smp = sc.render.resolution_percentage, sc.cycles.samples
sc.render.resolution_percentage = 40; sc.cycles.samples = 48
fp = sc.render.filepath
tiles = []
for k, st in enumerate(states):
    if isinstance(st, int):
        sc.frame_set(st)
    else:
        ob = bpy.data.objects['Pose']; ob.data.shape_keys.key_blocks['Aapen'].value = st[0]; ob.rotation_euler = st[1]
    sc.render.filepath = R + 'chk/chk_%02d.png' % k
    bpy.ops.render.render(write_still=True)
    im = bpy.data.images.load(sc.render.filepath); im.reload()
    tiles.append(np.array(im.pixels[:], dtype=np.float32).reshape(im.size[1], im.size[0], 4)); bpy.data.images.remove(im)
sc.render.resolution_percentage = pct; sc.cycles.samples = smp; sc.render.filepath = fp
h, w = tiles[0].shape[:2]; n = len(tiles)
sheet = np.zeros((h, w * n, 4), dtype=np.float32); sheet[..., :3] = 0.3; sheet[..., 3] = 1
for k, t in enumerate(tiles):
    a = t[..., 3:4]; sheet[:, k * w:(k + 1) * w, :3] = t[..., :3] * a + 0.3 * (1 - a)
name = 'strip_%d' % n
cs = bpy.data.images.get(name)
if cs and tuple(cs.size) != (w * n, h): bpy.data.images.remove(cs); cs = None
cs = cs or bpy.data.images.new(name, w * n, h, alpha=True)
cs.pixels[:] = sheet.ravel()
win = bpy.context.window
for a in win.screen.areas:
    if a.type == 'IMAGE_EDITOR':
        a.spaces.active.image = cs
        with bpy.context.temp_override(window=win, area=a, region=[r for r in a.regions if r.type == 'WINDOW'][0]):
            bpy.ops.image.view_all(fit_view=True)
bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1)
result = {'tiles': n}
