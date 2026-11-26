from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.section import WD_ORIENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from pathlib import Path

ROOT = Path.cwd()
PNG = ROOT / '.mykandang_network_topology.png'
OUT = ROOT / 'Arsitektur_Jaringan_MyKandang.docx'
W, H = 1720, 430
im = Image.new('RGB', (W, H), 'white')
d = ImageDraw.Draw(im)
font_dir = Path(r'C:\Windows\Fonts')
regular = ImageFont.truetype(str(font_dir / 'arial.ttf'), 22)
small = ImageFont.truetype(str(font_dir / 'arial.ttf'), 19)
bold = ImageFont.truetype(str(font_dir / 'arialbd.ttf'), 23)
small_bold = ImageFont.truetype(str(font_dir / 'arialbd.ttf'), 20)
label_font = ImageFont.truetype(str(font_dir / 'arial.ttf'), 17)
black = (0,0,0)

# Box layout follows the plain, monochrome reference style.
def node(box, title, lines):
    x1,y1,x2,y2 = box
    d.rectangle(box, outline=black, width=3)
    head_bottom = y1 + 48
    d.line((x1,head_bottom,x2,head_bottom), fill=black, width=2)
    bb = d.textbbox((0,0), title, font=bold)
    d.text(((x1+x2-(bb[2]-bb[0]))/2, y1+9), title, fill=black, font=bold)
    line_h = 28
    start_y = head_bottom + 13
    for i, line in enumerate(lines):
        bb = d.textbbox((0,0), line, font=small)
        d.text(((x1+x2-(bb[2]-bb[0]))/2, start_y+i*line_h), line, fill=black, font=small)

def arrow_head(p1,p2,size=15):
    import math
    x1,y1=p1; x2,y2=p2
    a=math.atan2(y2-y1,x2-x1)
    left=(x2-size*math.cos(a-math.pi/6),y2-size*math.sin(a-math.pi/6))
    right=(x2-size*math.cos(a+math.pi/6),y2-size*math.sin(a+math.pi/6))
    d.polygon([p2,left,right], fill=black)

def line_arrow(points, both=False, width=3):
    d.line(points, fill=black, width=width, joint='curve')
    arrow_head(points[-2],points[-1])
    if both:
        arrow_head(points[1],points[0])

def dashed(points, dash=13, gap=9, width=3):
    import math
    for (x1,y1),(x2,y2) in zip(points,points[1:]):
        dx,dy=x2-x1,y2-y1
        length=math.hypot(dx,dy)
        if not length: continue
        ux,uy=dx/length,dy/length
        pos=0
        while pos < length:
            end=min(pos+dash,length)
            d.line((x1+ux*pos,y1+uy*pos,x1+ux*end,y1+uy*end),fill=black,width=width)
            pos=end+gap
    arrow_head(points[-2],points[-1])

def centered_label(text, center_x, y, font=label_font):
    bb=d.textbbox((0,0),text,font=font)
    tw=bb[2]-bb[0]
    pad=5
    d.rectangle((center_x-tw/2-pad,y-2,center_x+tw/2+pad,y+bb[3]-bb[1]+3),fill='white')
    d.text((center_x-tw/2,y),text,font=font,fill=black)

# Main clients and public entry path.
node((45,112,325,265), 'Klien', ['Laptop / ponsel', 'Browser modern + JavaScript'])
node((420,112,660,265), 'Internet', ['Wi-Fi / data seluler', 'Router/AP, ISP, DNS'])
node((745,92,1085,275), 'Vercel', ['Frontend: folder public/', 'API: Node.js + Express 5'])
node((1220,43,1660,190), 'PostgreSQL', ['Database cloud terkelola', 'Akses backend melalui TLS'])
node((1220,248,1660,395), 'Supabase Storage', ['Bucket publik: hewan', 'Foto diunggah oleh backend'])

# Browser to hosting, API to database, and backend image upload.
line_arrow([(325,190),(420,190)], both=True)
centered_label('HTTPS / 443',372,165)
line_arrow([(660,190),(745,190)], both=True)
centered_label('Halaman web + /api/*',702,165)
line_arrow([(1085,125),(1220,125)], both=True)
centered_label('SQL / TLS',1152,99)
line_arrow([(1038,275),(1122,318),(1220,318)])
centered_label('HTTPS upload',1137,282)

# Browser loads public image URLs directly from Supabase Storage.
dashed([(185,265),(185,414),(1440,414),(1440,395)], dash=15, gap=10)
centered_label('Browser membaca foto dari URL publik via HTTPS',705,385,small)

im.save(PNG, dpi=(180,180))

# Document setup.
doc = Document()
sec = doc.sections[0]
sec.orientation = WD_ORIENT.LANDSCAPE
sec.page_width = Inches(11.69)
sec.page_height = Inches(8.27)
sec.top_margin = Inches(.34)
sec.bottom_margin = Inches(.32)
sec.left_margin = Inches(.40)
sec.right_margin = Inches(.40)

normal = doc.styles['Normal']
normal.font.name = 'Arial'; normal.font.size = Pt(8.5); normal.font.color.rgb = None
normal._element.rPr.rFonts.set(qn('w:ascii'),'Arial')
normal._element.rPr.rFonts.set(qn('w:hAnsi'),'Arial')
normal.paragraph_format.space_after = Pt(0)
normal.paragraph_format.line_spacing = 1.0

title_style = doc.styles['Title']
title_style.font.name = 'Arial'; title_style.font.size = Pt(18); title_style.font.bold = True
title_style.font.color.rgb = None
title_style._element.rPr.rFonts.set(qn('w:ascii'),'Arial')
title_style._element.rPr.rFonts.set(qn('w:hAnsi'),'Arial')
title_style.paragraph_format.space_before = Pt(0)
title_style.paragraph_format.space_after = Pt(3)

p = doc.add_paragraph(style='Title')
p.paragraph_format.keep_with_next = True
p.add_run('2.4 Arsitektur Jaringan')

p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(3)
p.paragraph_format.keep_with_next = True
r=p.add_run('MyKandang memakai pola client-server berbasis cloud. Browser mengakses web dan API di Vercel; backend Express mengakses PostgreSQL dan mengunggah foto ke Supabase Storage. Browser membaca foto melalui URL publik Supabase.')
r.font.name='Arial'; r.font.size=Pt(8.5)

p=doc.add_paragraph()
p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after=Pt(1)
p.paragraph_format.keep_with_next=True
p.add_run().add_picture(str(PNG), width=Inches(10.86))

p=doc.add_paragraph()
p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before=Pt(0); p.paragraph_format.space_after=Pt(3)
p.paragraph_format.keep_with_next=True
r=p.add_run('Gambar 1. Topologi Jaringan MyKandang')
r.font.name='Arial'; r.font.size=Pt(8); r.font.bold=True

p=doc.add_paragraph()
p.paragraph_format.space_before=Pt(0); p.paragraph_format.space_after=Pt(2)
p.paragraph_format.keep_with_next=True
r=p.add_run('Tabel 4. Spesifikasi Komponen Jaringan')
r.font.name='Arial'; r.font.size=Pt(9); r.font.bold=True

rows = [
('Klien', 'Laptop/ponsel dengan browser modern dan JavaScript aktif; terhubung melalui Wi-Fi atau data seluler.', 'Membuka aplikasi, mengirim permintaan web/API, dan memuat foto melalui URL publik.'),
('Akses Internet', 'Router/access point dan ISP, atau jaringan seluler; DNS; HTTPS/TLS port 443 untuk trafik web.', 'Menghubungkan perangkat pengguna ke hosting serta layanan cloud. Tidak memerlukan server lokal khusus.'),
('Hosting aplikasi', 'Vercel; file frontend berada di public/; backend Node.js dan Express 5.', 'Menyajikan halaman dan endpoint /api/*, memeriksa autentikasi/role, serta menjalankan logika aplikasi.'),
('Basis data', 'PostgreSQL terkelola; alamat koneksi dibaca dari DATABASE_URL atau POSTGRES_URL. TLS digunakan pada deployment Vercel; port mengikuti provider (umumnya 5432).', 'Menyimpan akun, katalog, keranjang, pesanan, pembayaran, chat, dan ulasan. Koneksi database hanya dari backend.'),
('Penyimpanan foto', 'Supabase Storage, bucket publik hewan; batas unggah 5 MB; tipe JPEG, PNG, atau WebP.', 'Backend mengunggah melalui HTTPS. Browser menerima URL dan mengambil foto publik langsung dari Supabase.'),
]
table = doc.add_table(rows=1, cols=3)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.autofit=False
table.style='Table Grid'
widths=[Inches(1.75),Inches(4.48),Inches(4.63)]
headers=['Komponen','Spesifikasi','Peran dan alur komunikasi']
for i,(cell,text) in enumerate(zip(table.rows[0].cells,headers)):
    cell.width=widths[i]
    cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    cell.text=text
for comp,spec,role in rows:
    cells=table.add_row().cells
    for i,(cell,text) in enumerate(zip(cells,(comp,spec,role))):
        cell.width=widths[i]
        cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        cell.text=text

# Plain monochrome grid, no theme fills or colored text.
for ri,row in enumerate(table.rows):
    trPr=row._tr.get_or_add_trPr()
    trPr.append(OxmlElement('w:cantSplit'))
    for ci,cell in enumerate(row.cells):
        tcPr=cell._tc.get_or_add_tcPr()
        shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),'FFFFFF'); shd.set(qn('w:val'),'clear'); tcPr.append(shd)
        margins=OxmlElement('w:tcMar')
        for side,val in [('top','48'),('start','78'),('bottom','48'),('end','78')]:
            el=OxmlElement(f'w:{side}'); el.set(qn('w:w'),val); el.set(qn('w:type'),'dxa'); margins.append(el)
        tcPr.append(margins)
        borders=tcPr.first_child_found_in('w:tcBorders')
        if borders is None:
            borders=OxmlElement('w:tcBorders'); tcPr.append(borders)
        for edge in ('top','left','bottom','right','insideH','insideV'):
            tag='w:'+edge
            element=borders.find(qn(tag))
            if element is None:
                element=OxmlElement(tag); borders.append(element)
            element.set(qn('w:val'),'single'); element.set(qn('w:sz'),'6'); element.set(qn('w:space'),'0'); element.set(qn('w:color'),'000000')
        for p in cell.paragraphs:
            p.paragraph_format.space_after=Pt(0)
            p.paragraph_format.space_before=Pt(0)
            p.paragraph_format.line_spacing=1.0
            for run in p.runs:
                run.font.name='Arial'; run.font.size=Pt(8)
                run._element.get_or_add_rPr().rFonts.set(qn('w:ascii'),'Arial')
                run._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'),'Arial')
                run.font.bold = (ri==0 or ci==0)
                run.font.color.rgb=None

p=doc.add_paragraph()
p.paragraph_format.space_before=Pt(3); p.paragraph_format.space_after=Pt(0)
r=p.add_run('Catatan: '); r.bold=True; r.font.name='Arial'; r.font.size=Pt(7.5)
r=p.add_run('Penyedia dan kapasitas PostgreSQL ditentukan saat deployment, karena belum dikunci di repositori. DATABASE_URL, AUTH_SECRET, dan SUPABASE_SECRET_KEY disimpan sebagai variabel lingkungan backend. Pembayaran saat ini ditandai otomatis oleh aplikasi; payment gateway eksternal tidak digunakan.')
r.font.name='Arial'; r.font.size=Pt(7.5)

doc.core_properties.title='Arsitektur Jaringan MyKandang'
doc.core_properties.subject='Topologi jaringan dan spesifikasi komponen sistem MyKandang'
doc.core_properties.author=''
doc.save(OUT)
print(OUT)
