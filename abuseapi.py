import requests

ip = input("Enter IP to check on AlienVault OTX: ")
api_key = "YOUR_OTX_KEY"

url = f"https://otx.alienvault.com/api/v1/indicators/IPv4/{ip}/general"

headers = {"X-OTX-API-KEY": api_key}

response = requests.get(url, headers=headers)

print("\n=== AlienVault OTX Report ===")
print(response.json())
