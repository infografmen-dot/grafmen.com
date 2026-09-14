#!/usr/bin/env python3
"""Free, deterministic portfolio motion. Python 3 + Pillow + FFmpeg; no API.
Run: python3 scripts/render-portfolio-motion.py [drewmax hiker-film best hiker-brand drew-art jd]
Coordinates normalized to each output frame. Existing artwork stays unmodified.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import math, subprocess, sys, json
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets/portfolio'; OUT=ROOT/'assets/motion'; OUT.mkdir(exist_ok=True)
FPS=30; SECONDS=8; COUNT=FPS*SECONDS
RESAMPLE=Image.Resampling.LANCZOS

def load(name): return Image.open(SRC/name).convert('RGB')
A=load('drewmax-site-en.png'); B=load('film-hiker.png'); C=load('szkola-best.png').crop((0,0,1902,950))
D=load('hiker.webp'); E=load('drew-art.webp'); F=load('jd-ubezpieczenia.webp')
PALETTE=load('hiker/Hiker_brand.webp'); CONSTRUCT=load('hiker/Hiker_construction.webp')

def ease(x):
 x=max(0,min(1,x));return x*x*(3-2*x)
def prog(t,a,b): return ease((t-a)/(b-a))
def lerp(a,b,x): return a+(b-a)*x

def fit(im,w,h): return ImageOps.fit(im,(int(w),int(h)),method=RESAMPLE)
def place(bg,im,x,y,w,h=None,shadow=False):
 w=max(2,round(w));h=max(2,round(h or w*im.height/im.width));x=round(x);y=round(y)
 if shadow:
  sh=Image.new('RGBA',bg.size);ImageDraw.Draw(sh).rectangle((x,y+8,x+w,y+h+8),fill=(0,0,0,38));sh=sh.filter(ImageFilter.GaussianBlur(14));bg.paste(sh,(0,0),sh)
 bg.paste(im.resize((w,h),RESAMPLE),(x,y))
 return bg

def cover(im,w,h,zoom=1,dx=0,dy=0):
 base=fit(im,w,h);nw=round(w*zoom);nh=round(h*zoom)
 bg=Image.new('RGB',(w,h),'white');return place(bg,base,(w-nw)/2+dx,(h-nh)/2+dy,nw,nh)

def wipe(a,b,q,axis='x',reverse=False):
 if q<=0:return a
 if q>=1:return b
 mask=Image.new('L',a.size,0);dr=ImageDraw.Draw(mask);w,h=a.size
 if axis=='x':
  edge=round(w*q);dr.rectangle((w-edge if reverse else 0,0,w if reverse else edge,h),fill=255)
 else:
  edge=round(h*q);dr.rectangle((0,h-edge if reverse else 0,w,h if reverse else edge),fill=255)
 return Image.composite(b,a,mask)

def scene_mix(t,first,second,third):
 # Hold at start/end. Three scenes, directional reveals and a matching final frame.
 if t<1.4:return first
 if t<2.3:return wipe(first,second,prog(t,1.4,2.3),'x',True)
 if t<3.8:return second
 if t<4.7:return wipe(second,third,prog(t,3.8,4.7),'y',True)
 if t<6.4:return third
 if t<7.5:return Image.blend(third,first,prog(t,6.4,7.5))
 return first

SIZES={'drewmax':(1280,720),'hiker-film':(960,540),'best':(960,720),'hiker-brand':(960,720),'drew-art':(1000,700),'jd':(1000,700)}

def frame(name,t):
 w,h=SIZES[name]; pulse=math.sin(math.pi*max(0,min(1,(t-.5)/7)))**2
 if name=='drewmax':
  base=fit(A,w,h)
  # Entire English screen recedes left; real hero crop enters from right.
  q=prog(t,1.2,2.5)*(1-prog(t,5.8,7.4))
  bg=Image.new('RGB',(w,h),'#eceee8')
  sw=lerp(w,w*.77,q);sx=lerp(0,-w*.13,q);sy=lerp(0,h*.12,q)
  place(bg,A,sx,sy,sw,sw*A.height/A.width,shadow=q>.02)
  detail=A.crop((300,160,1450,975));dw=w*.51
  detail=fit(detail,dw,h*.72)
  place(bg,detail,lerp(w+50,w*.52,q),h*.17,dw,h*.72,shadow=q>.02)
  return bg
 if name=='hiker-film':
  # Existing photographic still, no invented/generated movie frames.
  return cover(B,w,h,1.035+.04*pulse,dx=-w*.017*pulse,dy=h*.006*pulse)
 if name=='best':
  base=Image.new('RGB',(w,h),'#eef1f8');place(base,C,0,h*.10,w)
  second=Image.new('RGB',(w,h),'#1e3773')
  q=prog(t,1.4,2.3)
  place(second,C,w*.07,h*.12,w*.86,shadow=True)
  # Typography and actual photo are two complementary close-ups of same site.
  third=Image.new('RGB',(w,h),'#f8f9fc')
  textcrop=C.crop((345,345,872,725));photocrop=C.crop((960,125,1600,915))
  place(third,textcrop,w*.04,h*.29,w*.57)
  place(third,photocrop,w*.65-14*prog(t,4.7,6.4),0,w*.57,h)
  return scene_mix(t,base,second,third)
 if name=='hiker-brand':
  base=fit(D,w,h)
  second=Image.new('RGB',(w,h),'#fff');place(second,PALETTE,0,(h-w*PALETTE.height/PALETTE.width)/2,w)
  third=Image.new('RGB',(w,h),'#f4f4f2');place(third,CONSTRUCT,0,(h-w*CONSTRUCT.height/CONSTRUCT.width)/2,w)
  return scene_mix(t,base,second,third)
 if name=='drew-art':
  # Crop real website panels out of supplied collage; do not rebuild fake UI.
  q=prog(t,1.0,2.3)*(1-prog(t,5.9,7.4))
  bg=Image.new('RGB',(w,h),'#e9e6e1')
  left=E.crop((46,32,478,397));right=E.crop((510,61,940,430));front=E.crop((201,399,650,653))
  place(bg,left,lerp(46,-80,q),lerp(32,-35,q),lerp(432,570,q),shadow=True)
  place(bg,right,lerp(510,595,q),lerp(61,110,q),lerp(430,500,q),shadow=True)
  place(bg,front,lerp(201,145,q),lerp(399,280,q),lerp(449,710,q),shadow=True)
  # Hold exact original collage at seam; dissolve into moving panel composition.
  alpha=prog(t,.35,.9)*(1-prog(t,7.3,7.8))
  return Image.blend(fit(E,w,h),bg,alpha)
 if name=='jd':
  base=fit(F,w,h)
  second=Image.new('RGB',(w,h),'#fff')
  # Undistorted entire mark, paired with its existing green/yellow brand colors.
  q=prog(t,1.4,2.3)
  dr=ImageDraw.Draw(second);dr.rectangle((w*.74,0,w,h*.5),fill='#75b51e');dr.rectangle((w*.74,h*.5,w,h),fill='#ffd600')
  place(second,F,-w*.12,h*.02,w*.98,h*.98)
  third=Image.new('RGB',(w,h),'#e9e9e9')
  # Two photographic detail panels: protection motif and readable full lockup.
  symbol=F.crop((240,60,746,365))
  place(third,symbol,-w*.19,h*.15,w*.88)
  place(third,F,w*.51,h*.15,w*.60,h*.60)
  return scene_mix(t,base,second,third)
 raise KeyError(name)

def render(name):
 w,h=SIZES[name];mp4=OUT/(name+'.mp4')
 cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{w}x{h}','-framerate',str(FPS),'-i','-','-an','-c:v','libx264','-preset','medium','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',str(mp4)]
 p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 for i in range(COUNT):
  im=frame(name,i/(COUNT-1)*SECONDS);p.stdin.write(im.tobytes())
  if i in (0,60,120,180): im.save(ROOT/'docs/motion'/f'{name}-{i:03}.jpg',quality=88)
  if i==0:im.save(OUT/(name+'-poster.webp'),quality=88)
 p.stdin.close()
 if p.wait():raise RuntimeError(name+' MP4 encode failed')
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(mp4),'-an','-c:v','libvpx-vp9','-b:v','0','-crf','33','-deadline','good','-cpu-used','4','-row-mt','1','-threads','2',str(OUT/(name+'.webm'))],check=True)
 print(name,'ready',flush=True)
 return {'name':name,'width':w,'height':h,'seconds':SECONDS,'fps':FPS,'mp4Bytes':mp4.stat().st_size,'webmBytes':(OUT/(name+'.webm')).stat().st_size}
if __name__=='__main__':
 names=sys.argv[1:] or list(SIZES)
 with ThreadPoolExecutor(max_workers=2) as pool: results=list(pool.map(render,names))
 all_results=[{'name':n,'width':wh[0],'height':wh[1],'seconds':SECONDS,'fps':FPS,'mp4Bytes':(OUT/(n+'.mp4')).stat().st_size,'webmBytes':(OUT/(n+'.webm')).stat().st_size} for n,wh in SIZES.items() if (OUT/(n+'.mp4')).exists() and (OUT/(n+'.webm')).exists()]
 (OUT/'manifest.json').write_text(json.dumps(all_results,indent=2)+'\n')
