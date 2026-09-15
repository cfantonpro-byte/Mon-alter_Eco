#!/usr/bin/env python3
import argparse, base64, json, mimetypes, os, re
from datetime import datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT=Path(__file__).resolve().parent
CONFIG=ROOT/'study-customizations.json'
UPLOADS=ROOT/'assets'/'editor-uploads'
ALLOWED_EXT={'.html','.css','.js','.json','.png','.jpg','.jpeg','.webp','.gif','.svg','.mp4','.mov','.woff','.woff2','.ico'}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        super().end_headers()
    def translate_path(self,path):
        clean=unquote(urlparse(path).path).lstrip('/') or 'index.html'
        target=(ROOT/clean).resolve()
        if ROOT not in target.parents and target!=ROOT:return str(ROOT/'__blocked__')
        if target.is_dir():target=target/'index.html'
        if target.suffix.lower() not in ALLOWED_EXT:return str(ROOT/'__blocked__')
        return str(target)
    def list_directory(self,path): self.send_error(403);return None
    def do_POST(self):
        if self.path not in ('/api/save-study-editor','/api/upload-study-asset'):self.send_error(404);return
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length<=0 or length>12*1024*1024:raise ValueError('invalid size')
            payload=json.loads(self.rfile.read(length))
            if self.path.endswith('save-study-editor'):
                if not isinstance(payload.get('pages'),dict):raise ValueError('invalid config')
                payload['updatedAt']=int(datetime.now().timestamp()*1000)
                CONFIG.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
                result={'ok':True,'savedAt':datetime.now().strftime('%H:%M:%S')}
            else:
                match=re.match(r'^data:(image/[a-zA-Z0-9.+-]+);base64,(.+)$',payload.get('data',''),re.S)
                if not match:raise ValueError('invalid image')
                ext=mimetypes.guess_extension(match.group(1)) or '.png';ext='.jpg' if ext=='.jpe' else ext
                stem=re.sub(r'[^a-zA-Z0-9_-]+','-',Path(payload.get('name','image')).stem).strip('-')[:60] or 'image'
                UPLOADS.mkdir(parents=True,exist_ok=True)
                filename=f'{datetime.now().strftime("%Y%m%d-%H%M%S")}-{stem}{ext}'
                (UPLOADS/filename).write_bytes(base64.b64decode(match.group(2),validate=True))
                result={'ok':True,'path':f'assets/editor-uploads/{filename}'}
            body=json.dumps(result).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
        except Exception as error:
            body=json.dumps({'ok':False,'error':str(error)}).encode();self.send_response(400);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--host',default='127.0.0.1');parser.add_argument('--port',type=int,default=8766);args=parser.parse_args()
    print(f'Mon Alter-Eco editor: http://{args.host}:{args.port}/index.html?test=1',flush=True)
    ThreadingHTTPServer((args.host,args.port),Handler).serve_forever()
