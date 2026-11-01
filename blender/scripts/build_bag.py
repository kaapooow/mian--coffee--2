import bpy, math, bmesh
from mathutils import Vector, noise

ROOT = '/Users/sindremarken/Downloads/mian_pose/'

# ---------- fresh file (bean file is already saved on disk) ----------
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)
for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras, bpy.data.images, bpy.data.actions):
    for b in list(coll):
        if b.users == 0 or coll is bpy.data.images:
            try: coll.remove(b)
            except Exception: pass
bpy.data.orphans_purge(do_recursive=True)
sc = bpy.context.scene
col = sc.collection

# ---------- dimensions ----------
W, D, H = 1.0, 0.56, 1.47      # width, gusset depth, height (closed)
NF, NS, NV = 48, 24, 84        # segments: front/back, side, height

def smooth(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)

# perimeter: front (y=-D/2, x -> +), right side, back (x -> -), left side
perim = []   # (panel, s in [-1,1])
for i in range(NF): perim.append(('F', -1 + 2 * i / NF))
for i in range(NS): perim.append(('R', -1 + 2 * i / NS))
for i in range(NF): perim.append(('B', -1 + 2 * i / NF))
for i in range(NS): perim.append(('L', -1 + 2 * i / NS))
NP = len(perim)

def base_xy(panel, s, w, d):
    if panel == 'F': return (s * w / 2, -d / 2)
    if panel == 'R': return (w / 2, s * d / 2)
    if panel == 'B': return (-s * w / 2, d / 2)
    return (-w / 2, -s * d / 2)

def closed_pos(panel, s, v):
    z = v * H
    vs = 0.60
    t = smooth((v - vs) / (1 - vs))
    d = D * (1 - t) + 0.022 * t
    w = W * (1 - 0.035 * t)
    bulge = math.sin(math.pi * min(1.0, v / 0.95)) * (1 - t)
    x, y = base_xy(panel, s, w, d)
    if panel in 'FB':
        y *= 1 + 0.17 * (1 - s * s) * bulge
        x *= 1 + 0.012 * bulge
    else:
        fold = (D - d) / 2
        sign = 1 if panel == 'R' else -1
        x = sign * (w / 2 - fold * (1 - abs(s)) * 0.98)
        x += sign * 0.045 * (1 - s * s) * bulge
    # soft rounded bottom edge
    if v < 0.03:
        k = 1 - 0.012 * (1 - v / 0.03)
        x *= k; y *= k
    return Vector((x, y, z))

def open_pos(panel, s, v):
    vb = 0.50
    if v <= vb:
        p = closed_pos(panel, s, v)
        # body a bit fuller when open
        p.x *= 1.02; p.y *= 1.06
        return p
    t = (v - vb) / (1 - vb)
    te = t ** 1.4
    w = W * (1.02 + 0.22 * te)
    d = D * (1.06 + 1.05 * te)
    x, y = base_xy(panel, s, w, d)
    z = v * H * (1 - 0.05 * te)
    # corners rise, panel middles dip -> petal rim
    corner = abs(s) ** 3
    z += te * (0.10 * corner - 0.05 * (1 - s * s))
    # front/back walls bow outward a little at the rim
    if panel in 'FB':
        y *= 1 + 0.08 * (1 - s * s) * te
    return Vector((x, y, z))

def wrinkle(p, amp, scale):
    n = noise.noise_vector(p * scale)
    return n * amp

verts_c, verts_o, uvs = [], [], []
for j in range(NV + 1):
    v = j / NV
    for (panel, s) in perim:
        pc = closed_pos(panel, s, v)
        po = open_pos(panel, s, v)
        key = Vector((s * 3.1 + 'FRBL'.index(panel) * 7.3, v * 4.0, 0.37))
        pc += wrinkle(key, 0.0035, 2.5) + wrinkle(key, 0.0012, 9.0)
        top = max(0.0, (v - 0.5) / 0.5)
        po += wrinkle(key, 0.0035 + 0.018 * top, 2.5) + wrinkle(key, 0.0015 + 0.004 * top, 9.0)
        verts_c.append(pc); verts_o.append(po)

def vid(i, j): return j * NP + (i % NP)

faces, fpanel, fuv = [], [], []
for j in range(NV):
    for i in range(NP):
        faces.append((vid(i, j), vid(i + 1, j), vid(i + 1, j + 1), vid(i, j + 1)))
        panel, s0 = perim[i]
        s1 = s0 + (2 / NF if panel in 'FB' else 2 / NS)
        u0, u1 = (s0 + 1) / 2, (s1 + 1) / 2
        v0, v1 = j / NV, (j + 1) / NV
        fpanel.append(panel)
        fuv.append(((u0, v0), (u1, v0), (u1, v1), (u0, v1)))

me = bpy.data.meshes.new('Pose')
me.from_pydata([p - Vector((0, 0, H / 2)) for p in verts_c], [], faces)
# bottom cap
bm = bmesh.new(); bm.from_mesh(me)
bm.verts.ensure_lookup_table()
ring = [bm.verts[vid(i, 0)] for i in range(NP)]
bottom = bm.faces.new(list(reversed(ring)))
bm.to_mesh(me); bm.free()

uvl = me.uv_layers.new(name='UVMap')
for fi, poly in enumerate(me.polygons):
    if fi < len(fuv):
        for k, li in enumerate(poly.loop_indices):
            uvl.data[li].uv = fuv[fi][k]
    else:
        for li in poly.loop_indices: uvl.data[li].uv = (0.5, 0.0)
    poly.material_index = 0 if (fi < len(fpanel) and fpanel[fi] == 'F') else 1
    poly.use_smooth = True

ob = bpy.data.objects.new('Pose', me)
col.objects.link(ob)
ob.shape_key_add(name='Lukket')
sk = ob.shape_key_add(name='Aapen')
for i, p in enumerate(verts_o):
    sk.data[i].co = p - Vector((0, 0, H / 2))
sk.value = 1.0

sol = ob.modifiers.new('Tykkelse', 'SOLIDIFY')
sol.thickness = 0.004; sol.offset = -1; sol.material_offset = 2; sol.use_even_offset = False; sol.use_quality_normals = True

# ---------- materials ----------
def paper_mat(name, img=None, color=(0.80, 0.78, 0.74), rough=0.62):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N['Principled BSDF']
    b.inputs['Roughness'].default_value = rough
    b.inputs['Sheen Weight'].default_value = 0.15
    tc = N.new('ShaderNodeTexCoord')
    # crinkle: two noise layers into bump
    n1 = N.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 90; n1.inputs['Detail'].default_value = 6
    n2 = N.new('ShaderNodeTexVoronoi'); n2.inputs['Scale'].default_value = 35; n2.feature = 'F1'
    L.new(tc.outputs['Object'], n1.inputs['Vector']); L.new(tc.outputs['Object'], n2.inputs['Vector'])
    mix = N.new('ShaderNodeMath'); mix.operation = 'MULTIPLY_ADD'
    mix.inputs[1].default_value = 0.6
    L.new(n2.outputs['Distance'], mix.inputs[0]); L.new(n1.outputs['Fac'], mix.inputs[2])
    bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.12; bump.inputs['Distance'].default_value = 0.002
    L.new(mix.outputs[0], bump.inputs['Height'])
    # heat-seal ridges at the very top (uses UV v)
    sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['UV'], sep.inputs['Vector'])
    wave = N.new('ShaderNodeMath'); wave.operation = 'SINE'
    mulv = N.new('ShaderNodeMath'); mulv.operation = 'MULTIPLY'; mulv.inputs[1].default_value = 900
    L.new(sep.outputs['Y'], mulv.inputs[0]); L.new(mulv.outputs[0], wave.inputs[0])
    band = N.new('ShaderNodeMapRange'); band.inputs['From Min'].default_value = 0.965; band.inputs['From Max'].default_value = 0.975
    L.new(sep.outputs['Y'], band.inputs['Value'])
    seal = N.new('ShaderNodeMath'); seal.operation = 'MULTIPLY'
    L.new(wave.outputs[0], seal.inputs[0]); L.new(band.outputs['Result'], seal.inputs[1])
    bump2 = N.new('ShaderNodeBump'); bump2.inputs['Strength'].default_value = 0.35; bump2.inputs['Distance'].default_value = 0.003
    L.new(seal.outputs[0], bump2.inputs['Height']); L.new(bump.outputs['Normal'], bump2.inputs['Normal'])
    L.new(bump2.outputs['Normal'], b.inputs['Normal'])
    # color: image or flat, with faint mottling
    mott = N.new('ShaderNodeTexNoise'); mott.inputs['Scale'].default_value = 12
    L.new(tc.outputs['Object'], mott.inputs['Vector'])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = 0.96; mr.inputs['To Max'].default_value = 1.03
    L.new(mott.outputs['Fac'], mr.inputs['Value'])
    mulc = N.new('ShaderNodeMix'); mulc.data_type = 'RGBA'; mulc.blend_type = 'MULTIPLY'; mulc.inputs['Factor'].default_value = 1.0
    if img:
        tex = N.new('ShaderNodeTexImage'); tex.image = img; tex.interpolation = 'Cubic'
        tex.extension = 'EXTEND'
        L.new(tc.outputs['UV'], tex.inputs['Vector'])
        L.new(tex.outputs['Color'], mulc.inputs['A'])
        # printed ink slightly glossier
        inv = N.new('ShaderNodeMapRange'); inv.inputs['To Min'].default_value = 0.42; inv.inputs['To Max'].default_value = rough
        L.new(tex.outputs['Color'], inv.inputs['Value']); L.new(inv.outputs['Result'], b.inputs['Roughness'])
    else:
        mulc.inputs['A'].default_value = (*color, 1)
    L.new(mr.outputs['Result'], mulc.inputs['B'])
    L.new(mulc.outputs['Result'], b.inputs['Base Color'])
    return m

img = bpy.data.images.load(ROOT + 'front_print.jpg')
m_front = paper_mat('Pose front', img=img)
m_out = paper_mat('Pose utside', color=(0.80, 0.775, 0.735))
m_in = paper_mat('Pose innside', color=(0.62, 0.60, 0.57), rough=0.75)
for m in (m_front, m_out, m_in, m_in):
    me.materials.append(m)

bpy.ops.wm.save_as_mainfile(filepath=ROOT + 'mian_pose_animasjon.blend')
result = {'verts': len(me.vertices), 'faces': len(me.polygons), 'file': bpy.data.filepath}
