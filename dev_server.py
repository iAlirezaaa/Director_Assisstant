"""Dependency-free static preview; accepts the managed preview CLI options."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from functools import partial

parser = argparse.ArgumentParser()
parser.add_argument("--host", default="127.0.0.1")
parser.add_argument("--port", type=int, default=3000)
parser.add_argument("--strictPort", action="store_true")
args = parser.parse_args()
handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
ThreadingHTTPServer((args.host, args.port), handler).serve_forever()
