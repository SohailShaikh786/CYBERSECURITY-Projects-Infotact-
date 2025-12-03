#!/bin/bash
echo "==== Updating System ===="
sudo apt update -y
sudo apt upgrade -y

echo "==== Installing Required Packages ===="
sudo apt install curl python3 python3-pip -y
pip3 install requests

echo "==== AbuseIPDB API Call (example with 8.8.8.8) ===="
curl -G https://api.abuseipdb.com/api/v2/check \
  --data-urlencode "ipAddress=8.8.8.8" \
  -H "Key: YOUR_ABUSEIPDB_API_KEY" \
  -H "Accept: application/json"

echo "==== AlienVault OTX API Call (example with 8.8.8.8) ===="
curl "https://otx.alienvault.com/api/v1/indicators/IPv4/8.8.8.8/general" \
  -H "X-OTX-API-KEY: YOUR_OTX_API_KEY"

echo "==== Creating Python API Caller ===="
cat << 'EOF' > api_call.py
import requests

ip = input("Enter IP to check: ")
otx_key = "YOUR_OTX_API_KEY"

url = f"https://otx.alienvault.com/api/v1/indicators/IPv4/{ip}/general"
headers = {"X-OTX-API-KEY": otx_key}

response = requests.get(url, headers=headers)
print("\n===== AlienVault OTX Report =====\n")
print(response.json())
EOF

echo "==== Creating Bash API Caller ===="
cat << 'EOF' > api_lookup.sh
#!/bin/bash
read -p "Enter IP: " ip
curl "https://otx.alienvault.com/api/v1/indicators/IPv4/$ip/general" \
  -H "X-OTX-API-KEY: YOUR_OTX_API_KEY"
EOF

chmod +x api_lookup.sh

echo "==== Finished! ===="
echo "To use:"
echo "Run Python API call: python3 api_call.py"
echo "Run Bash API call: ./api_lookup.sh"
