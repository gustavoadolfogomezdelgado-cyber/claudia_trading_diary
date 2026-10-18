import os
import sqlite3
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.environ.get('DB_PATH', os.path.join(BASE, 'claudia.db'))
API_KEY = os.environ.get('CLAUDIA_API_KEY', 'cambia-esta-clave')

app = Flask(__name__, static_folder=None)
CORS(app)


def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute('''CREATE TABLE IF NOT EXISTS trades(
      ticket TEXT PRIMARY KEY,
      time TEXT NOT NULL,
      symbol TEXT NOT NULL,
      profit REAL NOT NULL DEFAULT 0,
      commission REAL NOT NULL DEFAULT 0,
      swap REAL NOT NULL DEFAULT 0,
      volume REAL NOT NULL DEFAULT 0,
      type TEXT DEFAULT ''
    )''')
    return c


def auth():
    return request.headers.get('X-API-Key') == API_KEY


@app.get('/')
def index():
    return send_from_directory(BASE, 'index.html')


@app.get('/manifest.webmanifest')
def manifest():
    resp = make_response(send_from_directory(BASE, 'manifest.webmanifest'))
    resp.headers['Content-Type'] = 'application/manifest+json; charset=utf-8'
    resp.headers['Cache-Control'] = 'no-cache'
    return resp


@app.get('/sw.js')
def service_worker():
    resp = make_response(send_from_directory(BASE, 'sw.js'))
    resp.headers['Content-Type'] = 'application/javascript; charset=utf-8'
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Service-Worker-Allowed'] = '/'
    return resp


@app.get('/<path:filename>')
def static_files(filename):
    return send_from_directory(BASE, filename)


@app.get('/api/health')
def health():
    return jsonify({'ok': True, 'time': datetime.now(timezone.utc).isoformat()})


@app.get('/api/trades')
def get_trades():
    if not auth():
        return jsonify({'error': 'unauthorized'}), 401
    c = db()
    rows = c.execute('SELECT ticket,time,symbol,profit,commission,swap,volume,type FROM trades ORDER BY time').fetchall()
    c.close()
    return jsonify([dict(r) for r in rows])


@app.post('/api/trades')
def post_trades():
    if not auth():
        return jsonify({'error': 'unauthorized'}), 401
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({'error': 'invalid json'}), 400
    items = payload if isinstance(payload, list) else [payload]
    c = db()
    n = 0
    for t in items:
        try:
            c.execute('''INSERT INTO trades(ticket,time,symbol,profit,commission,swap,volume,type)
            VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(ticket) DO UPDATE SET time=excluded.time,symbol=excluded.symbol,
            profit=excluded.profit,commission=excluded.commission,swap=excluded.swap,volume=excluded.volume,type=excluded.type''', (
                str(t['ticket']), str(t['time']), str(t['symbol']), float(t.get('profit', 0)),
                float(t.get('commission', 0)), float(t.get('swap', 0)), float(t.get('volume', 0)), str(t.get('type', ''))
            ))
            n += 1
        except Exception:
            pass
    c.commit()
    c.close()
    return jsonify({'ok': True, 'saved': n})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', '8000')))
