from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random

# Front panel texture, laid out like the product photo (1006 x 1476 reference)
REF_W, REF_H = 1006, 1476
W, H = 1200, 1761
s = W / REF_W
def S(v): return int(round(v * s))

PAPER = (233, 229, 223)
INK = (22, 20, 19)
img = Image.new('RGB', (W, H), PAPER)
d = ImageDraw.Draw(img)

font_b = '/usr/share/fonts/truetype/inter/Inter-SemiBold.ttf'
font_m = '/usr/share/fonts/truetype/inter/Inter-Medium.ttf'
import glob
def find(name):
    for p in glob.glob('/usr/share/fonts/**/' + name, recursive=True):
        return p
font_b = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
font_m = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
F_zip = ImageFont.truetype(font_b, S(24))
F_pill = ImageFont.truetype(font_b, S(21))
F_pull = ImageFont.truetype(font_b, S(15))

# --- zipper print row
y_txt = S(228)
d.text((S(218), y_txt), 'PULL RIP ZIP TO OPEN', font=F_zip, fill=INK, anchor='lm')
for i in range(11):
    cx = S(522 + i * 37); r = S(9)
    d.polygon([(cx - r, y_txt - r), (cx - r, y_txt + r), (cx + r, y_txt)], fill=INK)

# --- PULL tab with notch
tx0, ty0, tx1, ty1 = S(142), S(160), S(182), S(290)
d.rounded_rectangle([tx0, ty0, tx1, ty1], radius=S(6), fill=INK)
d.polygon([(tx1, S(200)), (tx1, S(250)), (S(205), S(225))], fill=INK)
tab = Image.new('RGBA', (ty1 - ty0, tx1 - tx0), (0, 0, 0, 0))
ImageDraw.Draw(tab).text(((ty1 - ty0) // 2, (tx1 - tx0) // 2), 'PULL', font=F_pull, fill=(235, 235, 235), anchor='mm')
tab = tab.rotate(-90, expand=True)
img.paste(tab, (tx0, ty0), tab)
# tear notch outline (keyhole)
d.ellipse([S(112), S(208), S(136), S(244)], outline=(170, 166, 160), width=S(2))

# --- checker zipper band
yb = S(300); sq = S(7)
x = S(140)
k = 0
while x < S(872):
    for row in range(2):
        if (k + row) % 2 == 0:
            d.rectangle([x, yb - sq + row * sq, x + sq - 1, yb + row * sq - 1], fill=INK)
    x += sq; k += 1

# --- PRESS TO RESEAL pill
pw, ph = S(250), S(34); cx, cy = S(522), S(312)
d.rounded_rectangle([cx - pw // 2, cy - ph // 2, cx + pw // 2, cy + ph // 2], radius=ph // 2, fill=INK)
d.text((cx, cy), 'PRESS TO RESEAL', font=F_pill, fill=(240, 240, 238), anchor='mm')

# --- valve: embossed ring + 4 vent dots (shading kept subtle, bump does the rest)
vx, vy, vr = S(515), S(458), S(54)
d.ellipse([vx - vr, vy - vr, vx + vr, vy + vr], outline=(205, 201, 195), width=S(3))
d.ellipse([vx - vr + S(4), vy - vr + S(4), vx + vr - S(4), vy + vr - S(4)], outline=(244, 241, 236), width=S(2))
for dx, dy in [(0, -26), (-30, 2), (30, 2), (0, 30)]:
    rr = S(4)
    d.ellipse([vx + S(dx) - rr, vy + S(dy) - rr, vx + S(dx) + rr, vy + S(dy) + rr], fill=(40, 38, 36))

# --- label
lx0, ly0, lx1, ly1 = S(205), S(585), S(830), S(1226)
lw, lh = lx1 - lx0, ly1 - ly0
lab = Image.open('/mnt/user-data/attachments/a0377c37-df0b-5991-bad7-f7ddf96ea166/ff5722a2-image.png').convert('RGBA')
bg = Image.new('RGBA', lab.size, (244, 242, 238, 255))
lab = Image.alpha_composite(bg, lab).convert('RGB')
from PIL import ImageEnhance
lab = Image.eval(lab, lambda v: int(v*0.955))
sc = max(lw / lab.width, lh / lab.height)
lab = lab.resize((int(lab.width * sc + 0.5), int(lab.height * sc + 0.5)), Image.LANCZOS)
ox = (lab.width - lw) // 2
lab = lab.crop((ox, 0, ox + lw, lh))
mask = Image.new('L', (lw, lh), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, lw - 1, lh - 1], radius=S(22), fill=255)
# soft sticker edge shadow
sh = Image.new('L', (W, H), 0)
ImageDraw.Draw(sh).rounded_rectangle([lx0, ly0 + S(2), lx1, ly1 + S(2)], radius=S(22), fill=60)
sh = sh.filter(ImageFilter.GaussianBlur(S(3)))
img = Image.composite(Image.new('RGB', (W, H), (200, 196, 190)), img, sh)
img.paste(lab, (lx0, ly0), mask)

# --- light paper speckle
random.seed(7)
d = ImageDraw.Draw(img)
px = img.load()
for _ in range(9000):
    x = random.randrange(W); y = random.randrange(H)
    r, g, b = px[x, y]
    if abs(r - PAPER[0]) < 12 and abs(b - PAPER[2]) < 12:
        v = random.choice([-9, -6, 6, 8])
        px[x, y] = (r + v, g + v, b + v)

img.save('front_print.jpg', quality=90, optimize=True)
img.resize((W // 2, H // 2)).save('front_preview.png')
print(img.size)
