import os
import base64
import json
import re

def get_mime(path):
    if path.endswith('.png'): return 'image/png'
    if path.endswith('.mp3'): return 'audio/mpeg'
    if path.endswith('.json'): return 'application/json'
    return 'application/octet-stream'

def main():
    print("Building standalone HTML...")
    assets = {}
    
    # Read all assets
    for root, dirs, files in os.walk('.'):
        for f in files:
            path = os.path.relpath(os.path.join(root, f), '.').replace('\\', '/')
            if path.startswith('sprites/') or path.startswith('sounds/'):
                with open(path, 'rb') as file:
                    data = file.read()
                    if path.endswith('.json'):
                        # parse json, replace image path with base64
                        j = json.loads(data.decode('utf-8'))
                        if 'meta' in j and 'image' in j['meta']:
                            img_path = os.path.join(os.path.dirname(path), j['meta']['image']).replace('\\', '/')
                            with open(img_path, 'rb') as img_file:
                                img_data = img_file.read()
                                b64 = base64.b64encode(img_data).decode('utf-8')
                                mime = get_mime(img_path)
                                j['meta']['image'] = f"data:{mime};base64,{b64}"
                        data = json.dumps(j).encode('utf-8')
                        
                    b64 = base64.b64encode(data).decode('utf-8')
                    mime = get_mime(path)
                    assets[path] = f"data:{mime};base64,{b64}"
                    print(f"Packed {path}")

    # Read index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Replace CSS
    def replace_css(match):
        css_path = match.group(1)
        with open(css_path, 'r', encoding='utf-8') as f:
            css = f.read()
        # also replace fonts inside css
        font_match = re.search(r'url\([\'"]?(.*?\.ttf)[\'"]?\)', css)
        if font_match:
            font_path = os.path.join('css', font_match.group(1)).replace('\\', '/')
            with open(font_path, 'rb') as f:
                b64 = base64.b64encode(f.read()).decode('utf-8')
                css = css.replace(font_match.group(1), f"data:font/ttf;base64,{b64}")
        return f'<style>{css}</style>'
    html = re.sub(r'<link rel="stylesheet" href="(.*?)">', replace_css, html)
    
    # Replace scripts
    def replace_js(match):
        js_path = match.group(1)
        with open(js_path, 'r', encoding='utf-8') as f:
            js = f.read()
        return f'<script>{js}</script>'
    html = re.sub(r'<script src="(.*?)"></script>', replace_js, html)
    
    # Inject assets
    assets_js = f"<script>window.ASSETS = {json.dumps(assets)};</script>"
    
    # we need to inject the PIXI and Howler loader override right after Game.js is loaded,
    # or just before Game.init() is called.
    # Actually, injecting right before Game.init() in the inline script is best.
    override_js = """
<script>
(function(){
    // Override Howler
    var OriginalHowl = Howl;
    window.Howl = function(options) {
        if (options.src && options.src.length > 0) {
            var path = options.src[0];
            if (window.ASSETS[path]) {
                options.src[0] = window.ASSETS[path];
            }
        }
        return new OriginalHowl(options);
    };
    
    // Override PIXI loader
    var origAdd = PIXI.loaders.Loader.prototype.add;
    PIXI.loaders.Loader.prototype.add = function(name, url, options, cb) {
        if (typeof name === 'object') {
            // handle object case if any
            return origAdd.apply(this, arguments);
        }
        var actualUrl = url || name;
        if (window.ASSETS[actualUrl]) {
            url = window.ASSETS[actualUrl];
        }
        return origAdd.call(this, name, url, options, cb);
    };
})();
</script>
"""
    
    # inject ASSETS and overrides right before <!-- Game Scripts -->
    html = html.replace('<!-- Game Scripts -->', assets_js + override_js + '<!-- Game Scripts -->')
    
    with open('wbwwb_standalone.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Done! Wrote wbwwb_standalone.html")

if __name__ == '__main__':
    main()
