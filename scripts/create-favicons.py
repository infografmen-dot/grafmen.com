from PIL import Image
import os
import shutil
import base64

src_path = r'C:\Users\infog\.gemini\antigravity-ide\brain\fd0e55ad-018d-4807-bc3a-e47313c8366d\.user_uploaded\media_1789738968260.png'
root_dir = r'd:\www\grafmen\aero'
assets_dir = os.path.join(root_dir, 'assets')

# Load original
with open(src_path, 'rb') as f:
    orig_bytes = f.read()

orig_b64 = base64.b64encode(orig_bytes).decode('ascii')
img = Image.open(src_path).convert('RGBA')

# 1. Favicon PNG exact copies
with open(os.path.join(assets_dir, 'favicon.png'), 'wb') as f:
    f.write(orig_bytes)
with open(os.path.join(assets_dir, 'favicon-512x512.png'), 'wb') as f:
    f.write(orig_bytes)

# 2. Resized PNGs
img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save(os.path.join(assets_dir, 'favicon-192x192.png'), 'PNG')

img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
img_32.save(os.path.join(assets_dir, 'favicon-32x32.png'), 'PNG')

img_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
img_16.save(os.path.join(assets_dir, 'favicon-16x16.png'), 'PNG')

# 3. Favicon ICO (multi-size: 16, 32, 48)
ico_sizes = [(16, 16), (32, 32), (48, 48)]
img.save(os.path.join(root_dir, 'favicon.ico'), format='ICO', sizes=ico_sizes)
img.save(os.path.join(assets_dir, 'favicon.ico'), format='ICO', sizes=ico_sizes)

# 4. Apple Touch Icon (180x180) with solid white background
apple_canvas = Image.new('RGBA', (512, 512), (255, 255, 255, 255))
apple_canvas.alpha_composite(img)
apple_180 = apple_canvas.convert('RGB').resize((180, 180), Image.Resampling.LANCZOS)
apple_180.save(os.path.join(root_dir, 'apple-touch-icon.png'), 'PNG')
apple_180.save(os.path.join(assets_dir, 'apple-touch-icon.png'), 'PNG')

# 5. Adaptive SVG favicon (supports dark mode by inverting in dark mode)
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <style>
    @media (prefers-color-scheme: dark) {{
      .favicon-img {{
        filter: invert(1);
      }}
    }}
  </style>
  <image class="favicon-img" width="512" height="512" href="data:image/png;base64,{orig_b64}"/>
</svg>
'''
with open(os.path.join(root_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_content)
with open(os.path.join(assets_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_content)

print("All favicon assets successfully generated:")
print(" - favicon.ico (root & assets/)")
print(" - favicon.svg (root & assets/)")
print(" - apple-touch-icon.png (root & assets/)")
print(" - favicon.png (assets/)")
print(" - favicon-512x512.png (assets/)")
print(" - favicon-192x192.png (assets/)")
print(" - favicon-32x32.png (assets/)")
print(" - favicon-16x16.png (assets/)")
