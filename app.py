from flask import Flask, render_template, request, Response, redirect, url_for
import requests
import os
import json
from dotenv import load_dotenv
import re
import asyncio
import httpx

load_dotenv()

app = Flask(__name__)

# Environment variables
CONFLUENCE_EMAIL = os.getenv("CONFLUENCE_EMAIL")
CONFLUENCE_API_TOKEN = os.getenv("CONFLUENCE_API_TOKEN")
CONFLUENCE_DOMAIN = os.getenv("CONFLUENCE_DOMAIN")
CONFLUENCE_SPACE_KEY = os.getenv("CONFLUENCE_SPACE_KEY")

# Alias map file
ALIAS_MAP_FILE = "alias_map.json"

def load_alias_map():
    if not os.path.exists(ALIAS_MAP_FILE):
        return {}
    with open(ALIAS_MAP_FILE, "r") as f:
        return json.load(f)

def save_alias_map(data):
    with open(ALIAS_MAP_FILE, "w") as f:
        json.dump(data, f, indent=4)

def resolve_title(title):
    alias_map = load_alias_map()
    return alias_map.get(title.strip().lower(), title.strip())

def get_page_by_title(title):
    resolved_title = resolve_title(title)

    url = f"https://{CONFLUENCE_DOMAIN}/wiki/rest/api/content/search"
    cql = f'space="{CONFLUENCE_SPACE_KEY}" AND title~"{resolved_title}"'
    params = {
        "cql": cql,
        "expand": "body.view"
    }

    response = requests.get(
        url,
        params=params,
        auth=(CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN),
        headers={"Accept": "application/json"}
    )

    if response.status_code != 200:
        print("Error fetching from Confluence:", response.text)
        return None

    data = response.json()
    results = data.get("results", [])

    if results:
        return results[0]["body"]["view"]["value"]
    return None

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/confluence")
def get_confluence_instruction():
    title = request.args.get("title")
    if not title:
        return "Missing title", 400

    html = get_page_by_title(title)
    if html:
        return Response(html, mimetype="text/html")
    return f"No instructions found for '{title}'", 404

# --- Alias Manager Web Interface ---
@app.route("/alias-editor", methods=["GET", "POST"])
def alias_editor():
    if request.method == "POST":
        key = request.form.get("alias").strip().lower()
        value = request.form.get("target").strip()
        alias_map = load_alias_map()
        alias_map[key] = value
        save_alias_map(alias_map)
        return redirect(url_for("alias_editor"))

    alias_map = load_alias_map()
    return render_template("alias_editor.html", alias_map=alias_map)

@app.route("/alias-editor/delete", methods=["POST"])
def delete_alias():
    key = request.form.get("alias").strip().lower()
    alias_map = load_alias_map()
    if key in alias_map:
        del alias_map[key]
        save_alias_map(alias_map)
    return redirect(url_for("alias_editor"))

@app.route("/alias-map.json")
def get_alias_map():
    return load_alias_map()

# -------------------
VT_API_KEY = os.getenv("VT_API_KEY")
ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY")

def extract_indicators(text):
    def dedup(seq):
        seen = set()
        return [x for x in seq if not (x in seen or seen.add(x))]

    # Hash patterns (MD5, SHA1, SHA256)
    hash_pattern = r"\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b"

    # IPv4 pattern (tight)
    ipv4_pattern = (
        r"\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}"
        r"(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b"
    )

    # IPv6 pattern (generic, but will filter time later)
    ipv6_pattern = r"\b(?:[a-fA-F0-9]{1,4}:){2,7}[a-fA-F0-9]{1,4}\b"

    # Domain pattern (only known public TLDs)
    public_tlds = (
        "com|net|org|io|gov|edu|biz|info|co|me|dev|app|cloud|ai|tech|tv|xyz|uk|us|ca|de|jp|fr|it|nl"
    )
    domain_pattern = rf"\b(?:[a-zA-Z0-9-]+\.)+(?:{public_tlds})\b"

    # Extract raw indicators
    hashes = re.findall(hash_pattern, text)
    raw_ipv4s = re.findall(ipv4_pattern, text)
    raw_ipv6s = re.findall(ipv6_pattern, text)
    raw_domains = re.findall(domain_pattern, text)

    # Time-like IPv4s (e.g., 14.00.00)
    time_like_ipv4 = r"^(?:[01]?\d|2[0-3])\.(?:[0-5]?\d)\.(?:[0-5]?\d)$"
    filtered_ipv4s = [
        ip for ip in raw_ipv4s if not re.fullmatch(time_like_ipv4, ip)
    ]

    # Time-like colon strings (e.g., 06:37:41) sometimes match IPv6 — exclude these
    time_like_ipv6 = r"^\d{2}:\d{2}:\d{2}$"
    filtered_ipv6s = [
        ip for ip in raw_ipv6s if not re.fullmatch(time_like_ipv6, ip)
    ]

    # Domain blacklist (case-insensitive)
    domain_blacklist = {"eu.idr.insight.rapid7.com"}
    filtered_domains = [
        d for d in raw_domains if d.lower() not in domain_blacklist
    ]

    # Deduplicate
    hashes = dedup(hashes)
    filtered_ipv4s = dedup(filtered_ipv4s)
    filtered_ipv6s = dedup(filtered_ipv6s)
    filtered_domains = dedup(filtered_domains)

    # Merge final IPs
    ips = filtered_ipv4s + filtered_ipv6s
    return hashes, ips, filtered_domains

# Async VT + AbuseIPDB wrappers
async def async_query_virustotal(client, hash_value):
    url = f"https://www.virustotal.com/api/v3/files/{hash_value}"
    try:
        r = await client.get(url)
        if r.status_code == 200:
            return {hash_value: r.json()}
        else:
            return {hash_value: {"error": r.json().get("error", {"message": r.text})}}
    except Exception as e:
        return {hash_value: {"error": {"message": str(e)}}}

async def async_query_virustotal_domain(client, domain):
    url = f"https://www.virustotal.com/api/v3/domains/{domain}"
    try:
        r = await client.get(url)
        if r.status_code == 200:
            return {domain: r.json()}
        else:
            return {domain: {"error": r.text}}
    except Exception as e:
        return {domain: {"error": str(e)}}

async def async_query_abuseipdb(client, ip):
    url = "https://api.abuseipdb.com/api/v2/check"
    try:
        r = await client.get(url, params={"ipAddress": ip, "maxAgeInDays": 90})
        if r.status_code == 200:
            return {ip: r.json()}
        else:
            return {ip: {"error": r.text}}
    except Exception as e:
        return {ip: {"error": str(e)}}


@app.route("/analyze", methods=["POST"])
def analyze_alert():
    text = request.json.get("text", "")
    hashes, ips, domains = extract_indicators(text)

    async def gather_all():
        async with httpx.AsyncClient(
            headers={"x-apikey": VT_API_KEY},
            timeout=10
        ) as vt_client, httpx.AsyncClient(
            headers={"Key": ABUSEIPDB_API_KEY, "Accept": "application/json"},
            timeout=10
        ) as abuse_client:
            tasks = []

            tasks += [async_query_virustotal(vt_client, h) for h in hashes]
            tasks += [async_query_abuseipdb(abuse_client, ip) for ip in ips]
            tasks += [async_query_virustotal_domain(vt_client, d) for d in domains]

            return await asyncio.gather(*tasks)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    gathered = loop.run_until_complete(gather_all())

    # Reorganize results
    results = {"hashes": [], "ips": [], "domains": []}
    for item in gathered:
        key = list(item.keys())[0]
        if key in hashes:
            results["hashes"].append(item)
        elif key in ips:
            results["ips"].append(item)
        elif key in domains:
            results["domains"].append(item)

    return results

if __name__ == "__main__":
    app.run(debug=True)
