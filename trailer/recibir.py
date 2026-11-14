# Servidor local minimo: recibe los cuadros y el audio del trailer (PUT) desde la pestana del juego y los guarda.
import base64, http.server, os, sys
DESTINO = sys.argv[1]

class H(http.server.BaseHTTPRequestHandler):
    def cors(self):
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:8123')
        self.send_header('Access-Control-Allow-Methods', 'PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.end_headers()
    def do_PUT(self):
        n = int(self.headers['Content-Length'])
        nombre = os.path.basename(self.path.strip('/')) or 'trailer.mp4'
        datos = self.rfile.read(n)
        if datos.startswith(b'data:'): datos = base64.b64decode(datos.split(b',', 1)[1])   # cuadros como dataURL
        with open(os.path.join(DESTINO, nombre), 'wb') as f: f.write(datos)
        self.send_response(200); self.cors(); self.end_headers(); self.wfile.write(b'ok')
        if not nombre.endswith('.png'): print('guardado', nombre, n, flush=True)

http.server.HTTPServer(('127.0.0.1', 8124), H).serve_forever()
