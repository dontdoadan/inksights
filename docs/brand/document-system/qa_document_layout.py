"""INKSIGHTS shared PDF preflight. pip install pymupdf; run: python qa_document_layout.py DIR --strict"""
import argparse,json
from pathlib import Path
import fitz

EXPECTED = {"01": (7,27), "02": (5,26), "03": (6,30), "04": (7,42), "05": (6,29)}
def scan(path):
    code=path.name[:2]; doc=fitz.open(path)
    r={"name":path.name,"pages":len(doc),"fields":0,"links":0,"issues":[]}
    if code in EXPECTED and len(doc)!=EXPECTED[code][0]:r["issues"].append("Unexpected page count")
    for idx,page in enumerate(doc):
        if abs(page.rect.width-595.28)>.6 or abs(page.rect.height-841.89)>.6:r["issues"].append(f"Page {idx+1}: not A4")
        spans=[(s["text"].strip(),fitz.Rect(s["bbox"])) for b in page.get_text("dict")["blocks"] for ln in b.get("lines",[]) for s in ln["spans"] if s["text"].strip()]
        text="\n".join(t for t,_ in spans)
        if 0<idx<len(doc)-1 and ("STUDIO INTELLIGENCE" not in text or "SMARTER DECISIONS" not in text):r["issues"].append(f"Page {idx+1}: shared shell missing")
        for t,b in spans:
            if b.x0<-1 or b.x1>596 or b.y0<-1 or b.y1>843:r["issues"].append(f"Page {idx+1}: off-page text {t[:40]}")
            if 0<idx<len(doc)-1 and 175<b.y0 and b.y1<780 and (b.x0<43 or b.x1>553):r["issues"].append(f"Page {idx+1}: outside editorial content rail {t[:40]}")
        seen=set()
        for widget in page.widgets() or []:
            r["fields"]+=1; rc=widget.rect
            if widget.field_name in seen:r["issues"].append(f"Page {idx+1}: duplicate field {widget.field_name}")
            seen.add(widget.field_name)
            if rc.x0<0 or rc.y0<0 or rc.x1>595.5 or rc.y1>842:r["issues"].append(f"Page {idx+1}: off-page input {widget.field_name}")
            for t,b in spans:
                if (b&rc).get_area()>10:r["issues"].append(f"Page {idx+1}: input/text overlap {widget.field_name} / {t[:25]}")
        r["links"]+=len(page.get_links())
    if code in EXPECTED and r["fields"]!=EXPECTED[code][1]:r["issues"].append("Unexpected number of input controls")
    doc.close()
    return r
def main():
    p=argparse.ArgumentParser();p.add_argument("pdf_dir",type=Path);p.add_argument("--strict",action="store_true");p.add_argument("--out",type=Path)
    a=p.parse_args();documents=[scan(x) for x in sorted(a.pdf_dir.glob("*.pdf"))]
    result={"schema":"inksights/docsys/v1.0/qa","files":len(documents),"pages":sum(x["pages"] for x in documents),"inputs":sum(x["fields"] for x in documents),"errors":sum(len(x["issues"]) for x in documents),"documents":documents,"caution":"Geometry-only. Visually render every page and test form persistence."}
    print(json.dumps(result,indent=2))
    if a.out:a.out.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
    if a.strict and (result["errors"] or len(documents)!=5):raise SystemExit(1)
if __name__=="__main__":main()
