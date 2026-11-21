"""INKSIGHTS A4 PDF composition primitives.

This is a reusable *starter renderer*, not the generator of record for existing
client PDFs. Use approved Poppins TTF/OTF exports via INKSIGHTS_FONT_REGULAR,
INKSIGHTS_FONT_SEMIBOLD and INKSIGHTS_FONT_BOLD environment variables.
Do not redistribute font files. Requires reportlab; optional cairosvg+Pillow
to use the current SVG logo from public/brand/logo-v3/.
"""
from __future__ import annotations
import json,os,tempfile
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE=Path(__file__).parent
TOKEN=json.loads((HERE/"design-tokens.json").read_text())
PAGE=TOKEN["page"];COLORS=TOKEN["palette"];COMPONENT=TOKEN["components"]

def _hex(v):return HexColor(v)
def _font_setup():
    entries=[("INKRegular","INKSIGHTS_FONT_REGULAR"),("INKSemi","INKSIGHTS_FONT_SEMIBOLD"),("INKBold","INKSIGHTS_FONT_BOLD")]
    for target,var in entries:
        path=os.getenv(var)
        if not path or not Path(path).is_file():
            raise RuntimeError(f"{var} is required: use approved, legally licensed Poppins font file, do not distribute it.")
        pdfmetrics.registerFont(TTFont(target,path))

def wrap(text,width,font,size):
    lines=[];current=""
    for word in str(text).split():
        s=(current+" "+word).strip()
        if not current or pdfmetrics.stringWidth(s,font,size)<=width:current=s
        else:lines.append(current);current=word
    if current:lines.append(current)
    if any(pdfmetrics.stringWidth(s,font,size)>width+0.5 for s in lines):
        raise ValueError("Unbreakable text exceeds declared width")
    return lines

class Document:
    """One shared cover / editorial worksheet / closing-page PDF shell."""
    def __init__(self,path,title,resource_code,logo_dark_svg,logo_light_svg):
        _font_setup()
        self.path=Path(path);self.title=title;self.code=resource_code
        self.c=canvas.Canvas(str(path),pagesize=(PAGE["width"],PAGE["height"]))
        self.page_number=0
        self.c.setTitle(f"INKSIGHTS | {title}")
        self._logos={"dark":Path(logo_dark_svg),"light":Path(logo_light_svg)}
        for p in self._logos.values():
            if not p.is_file():raise FileNotFoundError(f"Official logo asset not found: {p}")
    @property
    def height(self):return PAGE["height"]
    @property
    def width(self):return PAGE["width"]
    def rounded(self,x,top,w,h,r=11,fill="#FFFFFF",stroke=None):
        c=self.c;c.setFillColor(_hex(fill));c.setStrokeColor(_hex(stroke or fill))
        c.setLineWidth(0.75);c.roundRect(x,self.height-top-h,w,h,r,fill=1,stroke=bool(stroke))
    def text(self,x,top,s,size=9.5,color=None,font="INKRegular"):
        if x+pdfmetrics.stringWidth(str(s),font,size)>self.width-5:
            raise ValueError(f"Text crosses right edge: {s}")
        self.c.setFillColor(_hex(color or COLORS["light"]["text"]))
        self.c.setFont(font,size);self.c.drawString(x,self.height-top-size,str(s))
    def paragraph(self,x,top,text,width,size=9.5,leading=None,color=None,font="INKRegular"):
        leading=leading or size*1.4
        lines=wrap(text,width,font,size)
        for i,s in enumerate(lines):self.text(x,top+i*leading,s,size,color,font)
        return top+len(lines)*leading
    def official_logo(self,mode,x,top,w,h):
        try:import cairosvg
        except ImportError as exc:raise RuntimeError("cairosvg required to use canonical logo artwork") from exc
        with tempfile.NamedTemporaryFile(suffix=".png") as tmp:
            cairosvg.svg2png(url=str(self._logos[mode]),write_to=tmp.name,output_width=int(w*3))
            self.c.drawImage(ImageReader(tmp.name),x,self.height-top-h,w,h,preserveAspectRatio=True,mask="auto")
    def start_cover(self,kicker,heading,subheading):
        self.page_number+=1
        self.c.setFillColor(_hex(COLORS["dark"]["background"]));self.c.rect(0,0,self.width,self.height,fill=1,stroke=0)
        self.official_logo("dark",40,37,185,37)
        self.text(40,111,kicker.upper(),8,COLORS["dark"]["signalSoft"],"INKSemi")
        y=TOKEN["cover"]["titleTop"]
        for line in wrap(heading,TOKEN["cover"]["titleMaxWidth"],30,"INKBold"):
            self.text(40,y,line,30,COLORS["dark"]["text"],"INKBold");y+=40
        if y>330:raise ValueError("Cover title too long; revise copy or layout")
        self.paragraph(40,340,subheading,497,12,17,COLORS["dark"]["text"])
        self.c.linkURL("https://getinksights.co.uk/",(40,35,270,75),relative=0)
        self._footer(dark=True)
    def start_worksheet(self,title,strap,section="WORKSHEET"):
        self.page_number+=1
        self.c.setFillColor(_hex(COLORS["light"]["background"]))
        self.c.rect(0,0,self.width,self.height,stroke=0,fill=1)
        self.c.setFillColor(_hex(COLORS["dark"]["background"]))
        self.c.rect(0,self.height-75,self.width,75,stroke=0,fill=1)
        self.official_logo("dark",423,23,128,30)
        self.text(50,24,f"STUDIO INTELLIGENCE / {self.code}",7.4,COLORS["dark"]["signalSoft"],"INKSemi")
        self.text(50,45,f"{self.page_number:02d} / {section}",8,COLORS["dark"]["text"],"INKSemi")
        self.text(49,99,title,22.5,COLORS["light"]["text"],"INKBold")
        self.paragraph(49,138,strap,497,9.5,13.3,COLORS["light"]["muted"])
        self._footer()
        return 175
    def callout(self,top,title,body,height=84):
        if top+height>PAGE["contentEndY"]:raise ValueError("Callout exceeds content area")
        self.rounded(49,top,497,height,12,COLORS["light"]["surface"],COLORS["light"]["border"])
        self.rounded(49,top,4,height,1,COLORS["dark"]["signal"])
        self.text(65,top+12,title,10.5,COLORS["light"]["text"],"INKSemi")
        end=self.paragraph(65,top+32,body,463,9.2,13,COLORS["light"]["text"])
        if end>top+height-4:raise ValueError("Callout needs a taller container")
    def field(self,name,x,top,w=150,h=27,font_size=10):
        if top<175 or top+h>780 or x<49 or x+w>546:
            raise ValueError("Input field outside safe editorial page area")
        if h<23:raise ValueError("Visible input control must be at least 23pt tall")
        self.rounded(x,top,w,h,7,COLORS["light"]["background"],COLORS["light"]["border"])
        inset=COMPONENT["field"]["annotationInset"]
        self.c.acroForm.textfield(name=name,tooltip=name,x=x+inset,y=self.height-top-h+inset,
            width=w-2*inset,height=h-2*inset,borderWidth=0,
            textColor=_hex(COLORS["light"]["text"]),fillColor=_hex(COLORS["light"]["background"]),
            forceBorder=False,fontName="Helvetica",fontSize=font_size,value="")
    def _footer(self,dark=False):
        ink=COLORS["dark"]["text"] if dark else COLORS["light"]["muted"]
        self.c.setStrokeColor(_hex(COLORS["dark"]["border"] if dark else COLORS["light"]["border"]))
        self.c.line(49,self.height-784,546,self.height-784)
        self.text(49,795,"INKSIGHTS / CLEARER DATA. SMARTER DECISIONS. STRONGER STUDIOS.",7,ink,"INKSemi")
        self.text(516,797,f"{self.page_number:02d}",9,ink,"INKSemi")
        self.c.linkURL("https://getinksights.co.uk/",(49,20,275,56),relative=0)
    def page_break(self):self.c.showPage()
    def start_closing(self):
        self.page_number+=1
        self.c.setFillColor(_hex(COLORS["dark"]["background"]));self.c.rect(0,0,self.width,self.height,stroke=0,fill=1)
        self.official_logo("dark",43,41,176,36)
        for line,y,col in [("Data only matters",194,COLORS["dark"]["text"]),
                            ("when it changes",240,COLORS["dark"]["text"]),
                            ("the decision.",286,COLORS["dark"]["signalSoft"])]:
            self.text(43,y,line,30,col,"INKBold")
        self.paragraph(43,383,"Identify the constraint. Validate the evidence. Test one intervention.",497,12,18,COLORS["dark"]["text"])
        self.rounded(43,719,507,50,22,COLORS["dark"]["signal"])
        self.text(63,733,"EXPLORE THE STUDIO INTELLIGENCE AUDIT",11,COLORS["dark"]["background"],"INKBold")
        self.c.linkURL("https://getinksights.co.uk/",(43,self.height-769,550,self.height-719),relative=0)
        self._footer(dark=True)
    def save(self):self.c.save()
