#!/bin/bash

echo "===== Updating system ====="
sudo apt update && sudo apt upgrade -y

echo "===== Installing Snort ====="
sudo apt install snort -y

echo "===== Configuring Snort ====="
# Replace YOUR_IP with your Kali system's IP
sudo sed -i 's/ipvar HOME_NET any/ipvar HOME_NET YOUR_IP\/24/' /etc/snort/snort.conf

echo "===== Creating custom rule file ====="
sudo mkdir -p /etc/snort/rules
sudo bash -c 'cat > /etc/snort/rules/local.rules << EOF
alert icmp any any -> \$HOME_NET any (msg:"ICMP Ping Detected"; sid:1000001; rev:1;)
alert tcp any any -> \$HOME_NET 80 (msg:"HTTP Access Detected"; sid:1000002; rev:1;)
EOF'

echo "===== Updating snort.conf to include local.rules ====="
sudo sed -i 's/# include \$RULE_PATH\/local.rules/include \$RULE_PATH\/local.rules/' /etc/snort/snort.conf

echo "===== Testing Snort configuration ====="
sudo snort -T -c /etc/snort/snort.conf

echo "===== Running Snort in NIDS mode ====="
echo "Use the following command to monitor your network:"
echo "sudo snort -A console -i eth0 -c /etc/snort/snort.conf"
echo "===== To test alert trigger, use ping from another system ====="
echo "Example: ping YOUR_IP"

echo "===== Log file location ====="
/var/log/snort/alert
