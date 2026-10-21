"""Local-only design server; proxy read-only Vite guides under the same origin."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import urllib.request
import urllib.error

ROOT = Path(__file__).resolve().parents[2]

class DesignHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if not self.path.startswith('/_app/'):
            return super().do_GET()
        try:
            with urllib.request.urlopen('http://127.0.0.1:8091' + self.path, timeout=15) as response:
                body = response.read()
                self.send_response(response.status)
                self.send_header('Content-Type', response.headers.get('Content-Type', 'application/octet-stream'))
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(body)
        except (urllib.error.URLError, TimeoutError):
            self.send_error(503, 'Start the local guide server with start-local.ps1')

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8090), partial(DesignHandler, directory=str(ROOT)))
    print('SIGNAL design study: http://127.0.0.1:8090/experiments/keynote/', flush=True)
    server.serve_forever()
