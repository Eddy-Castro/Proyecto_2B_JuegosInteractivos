"""Servidor estático para desarrollo, SIN caché.

`python -m http.server` deja que el navegador cachee los .js de forma agresiva:
editas un archivo, recargas, y sigues viendo el código viejo. Eso produce fallos
fantasma muy confusos (por ejemplo, un main.js cacheado que referencia una clase
que ya borraste, y el juego entero deja de arrancar sin error visible).

Este servidor manda `Cache-Control: no-store` en cada respuesta, así que el
navegador siempre pide la versión actual.

Uso:
    python tools/servidor_dev.py [puerto]      # por defecto 8777
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class SinCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, formato, *args):  # menos ruido en consola
        if "404" in (formato % args):
            super().log_message(formato, *args)


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
    servidor = ThreadingHTTPServer(("127.0.0.1", puerto), partial(SinCache, directory="."))
    print(f"Sirviendo sin cache en http://localhost:{puerto}  (Ctrl+C para parar)")
    servidor.serve_forever()
