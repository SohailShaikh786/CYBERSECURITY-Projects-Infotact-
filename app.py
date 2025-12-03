from flask import Flask, request, render_template_string
import requests

app = Flask(__name__)

HTML_PAGE = """
<form method="get">
    Enter IP: <input name="ip">
    <input type="submit" value="Check">
</form>
<pre>{{ result }}</pre>
"""

@app.route("/", methods=["GET"])
def home():
    ip = request.args.get("ip")
    result = ""
    if ip:
        # AbuseIPDB
        abuseipdb_key = "3425c474100d6abf5d3441124adea1a27b0bc8e600444ed38551da82a06e646356"
        r1 = requests.get("https://api.abuseipdb.com/api/v2/check",
            params={"ipAddress": ip},
            headers={"Key": abuseipdb_key, "Accept": "application/json"}
        )

        # AlienVault OTX
        otx_key = "47e79154d7912a175571682a1ffded6954b2ce3ae0e9f56fb73c36aa3e256b36"
        url = f"https://otx.alienvault.com/api/v1/indicators/IPv4/{ip}/general"
        r2 = requests.get(url, headers={"X-OTX-API-KEY": otx_key})

        result = f"AbuseIPDB: {r1.json()}\n\nAlienVault OTX:\n{r2.json()}"

    return render_template_string(HTML_PAGE, result=result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
