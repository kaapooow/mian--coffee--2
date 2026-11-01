import bpy, math
from mathutils import Vector
sc = bpy.context.scene; col = sc.collection

def look(ob, target=(0, 0, 0)):
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat('-Z', 'Y').to_euler()

for n in ('Key', 'Fill', 'Rim_L', 'Rim_R', 'Top', 'Camera'):
    if n in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects[n], do_unlink=True)

def area(name, loc, energy, size, color, shape='RECTANGLE', sy=None):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.color = color; d.shape = shape
    d.size = size;
    if sy: d.size_y = sy
    o = bpy.data.objects.new(name, d); col.objects.link(o); o.location = loc; look(o); return o

# soft product-shot lighting
area('Key', (-3.6, -3.2, 2.4), 620, 3.0, (1.0, 0.96, 0.91), 'RECTANGLE', 4.0)
area('Fill', (3.8, -3.0, 0.8), 200, 4.5, (0.95, 0.97, 1.0))
area('Rim_L', (-2.6, 3.0, 1.6), 380, 1.5, (1.0, 0.97, 0.93))
area('Rim_R', (2.8, 3.0, 1.2), 320, 1.5, (1.0, 0.98, 0.96))
area('Top', (0, -0.6, 4.2), 200, 3.0, (1, 1, 1))

w = sc.world or bpy.data.worlds.new('World'); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes.get('Background'); bg.inputs[0].default_value = (0.5, 0.5, 0.5, 1); bg.inputs[1].default_value = 0.15

camd = bpy.data.cameras.new('Camera'); camd.lens = 85; camd.sensor_fit = 'AUTO'; camd.clip_end = 100
cam = bpy.data.objects.new('Camera', camd); col.objects.link(cam); sc.camera = cam
cam.location = (0, -6.2, 0.55); look(cam, (0, 0, 0.0))

sc.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type = 'METAL'; prefs.get_devices()
    for d in prefs.devices: d.use = True
    sc.cycles.device = 'GPU'
except Exception: pass
sc.cycles.samples = 128; sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.02
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x = 1080; sc.render.resolution_y = 1350; sc.render.resolution_percentage = 100
sc.render.use_persistent_data = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
bpy.ops.wm.save_mainfile()
result = {'ok': True}
