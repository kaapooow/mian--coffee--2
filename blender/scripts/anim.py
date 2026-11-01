import bpy, math, bpy_extras
sc = bpy.context.scene
ob = bpy.data.objects['Pose']

# --- material touch-ups: stronger paper crinkle, greyer inside
for m in bpy.data.materials:
    if not m.name.startswith('Pose'): continue
    bumps = [n for n in m.node_tree.nodes if n.type == 'BUMP']
    for n in bumps:
        if abs(n.inputs['Strength'].default_value - 0.12) < 1e-3 or abs(n.inputs['Strength'].default_value - 0.28) < 1e-3:
            n.inputs['Strength'].default_value = 0.28
    if m.name == 'Pose innside':
        for n in m.node_tree.nodes:
            if n.type == 'MIX' and n.data_type == 'RGBA':
                n.inputs['A'].default_value = (0.46, 0.445, 0.42, 1)

# --- timeline: 150 frames, scroll driven
sc.frame_start, sc.frame_end = 1, 150
sc.render.fps = 30
ob.animation_data_clear()
sk = ob.data.shape_keys
if sk.animation_data: sk.animation_data_clear()
ob.rotation_mode = 'XYZ'

TAU = 2 * math.pi
keys_rot = [
    (1,   (0.62, 0.0, 0.0)),     # open, tipped toward camera (start frame)
    (16,  (0.62, 0.0, 0.0)),     # short hold so the inside reads
    (96,  (0.14, 0.0, TAU)),     # one full turn while it seals
    (128, (-0.02, 0.0, TAU + 0.05)),  # tiny overshoot
    (150, (0.0, 0.0, TAU)),      # product shot
]
keys_loc = [(1, (0, 0, 0.08)), (96, (0, 0, 0.04)), (150, (0, 0, 0.0))]
for f, r in keys_rot:
    ob.rotation_euler = r; ob.keyframe_insert('rotation_euler', frame=f)
for f, l in keys_loc:
    ob.location = l; ob.keyframe_insert('location', frame=f)

kb = sk.key_blocks['Aapen']
for f, v in [(1, 1.0), (40, 1.0), (104, 0.0), (150, 0.0)]:
    kb.value = v; kb.keyframe_insert('value', frame=f)

def all_fcurves(idb):
    act = idb.animation_data.action
    out = []
    try:
        out = list(act.fcurves)
    except Exception:
        pass
    if not out and hasattr(act, 'layers'):
        for layer in act.layers:
            for strip in layer.strips:
                for cb in strip.channelbags: out += list(cb.fcurves)
    return out

for fc in all_fcurves(ob) + all_fcurves(sk):
    for k in fc.keyframe_points:
        k.interpolation = 'BEZIER'; k.handle_left_type = k.handle_right_type = 'AUTO_CLAMPED'
    fc.update()

# --- motion blur
sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5

# --- framing check over evaluated geometry
cam = sc.camera
mx = 0; worst = 0
for f in range(1, 151, 4):
    sc.frame_set(f)
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg); me = ev.to_mesh(); M = ev.matrix_world
    m = 0
    for i in range(0, len(me.vertices), 37):
        co = bpy_extras.object_utils.world_to_camera_view(sc, cam, M @ me.vertices[i].co)
        m = max(m, abs(co.x - 0.5), abs(co.y - 0.5))
    ev.to_mesh_clear()
    if m > mx: mx, worst = m, f
sc.frame_set(150)
sc.render.filepath = '/Users/sindremarken/Downloads/mian_pose/png/pose_'
bpy.ops.wm.save_mainfile()
result = {'max_half_extent': round(mx, 3), 'frame': worst}
