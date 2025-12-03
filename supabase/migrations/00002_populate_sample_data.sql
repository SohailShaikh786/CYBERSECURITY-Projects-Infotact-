/*
# Populate Sample Threat Intelligence Data

This migration adds realistic sample data for demonstration:
- Threat intelligence sources
- Sample IOCs (malicious IPs, domains, hashes)
- Sample network logs (benign and malicious)
- Sample alerts

Note: This is demonstration data for showcasing the system capabilities.
*/

-- Insert threat sources
INSERT INTO threat_sources (name, source_type, api_endpoint, last_updated, status, total_iocs) VALUES
('AlienVault OTX', 'api', 'https://otx.alienvault.com/api/v1', now() - interval '2 hours', 'active', 1250),
('AbuseIPDB', 'api', 'https://api.abuseipdb.com/api/v2', now() - interval '1 hour', 'active', 890),
('Malware Domain List', 'feed', 'https://www.malwaredomainlist.com/hostslist/hosts.txt', now() - interval '6 hours', 'active', 456),
('EmergingThreats', 'feed', 'https://rules.emergingthreats.net', now() - interval '3 hours', 'active', 2100);

-- Insert sample malicious IPs
INSERT INTO iocs (ioc_type, ioc_value, threat_type, severity, confidence, source_id, metadata) VALUES
('ip', '192.168.100.50', 'malware', 'critical', 95, (SELECT id FROM threat_sources WHERE name = 'AlienVault OTX' LIMIT 1), '{"country": "CN", "asn": "AS4134"}'),
('ip', '10.0.0.99', 'botnet', 'high', 88, (SELECT id FROM threat_sources WHERE name = 'AbuseIPDB' LIMIT 1), '{"country": "RU", "asn": "AS12345"}'),
('ip', '172.16.50.100', 'c2_server', 'critical', 92, (SELECT id FROM threat_sources WHERE name = 'EmergingThreats' LIMIT 1), '{"country": "KP", "asn": "AS9876"}'),
('ip', '203.0.113.45', 'scanning', 'medium', 70, (SELECT id FROM threat_sources WHERE name = 'AbuseIPDB' LIMIT 1), '{"country": "US", "asn": "AS15169"}'),
('ip', '198.51.100.78', 'brute_force', 'high', 85, (SELECT id FROM threat_sources WHERE name = 'AlienVault OTX' LIMIT 1), '{"country": "BR", "asn": "AS28573"}'),
('ip', '192.0.2.123', 'phishing', 'high', 90, (SELECT id FROM threat_sources WHERE name = 'AbuseIPDB' LIMIT 1), '{"country": "NG", "asn": "AS37148"}');

-- Insert sample malicious domains
INSERT INTO iocs (ioc_type, ioc_value, threat_type, severity, confidence, source_id, metadata) VALUES
('domain', 'malicious-site.evil', 'phishing', 'critical', 98, (SELECT id FROM threat_sources WHERE name = 'Malware Domain List' LIMIT 1), '{"registrar": "unknown", "created": "2024-01-15"}'),
('domain', 'bad-actor.com', 'malware', 'high', 87, (SELECT id FROM threat_sources WHERE name = 'AlienVault OTX' LIMIT 1), '{"registrar": "namecheap", "created": "2024-02-20"}'),
('domain', 'c2-command.net', 'c2_server', 'critical', 96, (SELECT id FROM threat_sources WHERE name = 'EmergingThreats' LIMIT 1), '{"registrar": "godaddy", "created": "2024-03-10"}'),
('domain', 'fake-bank-login.org', 'phishing', 'critical', 99, (SELECT id FROM threat_sources WHERE name = 'Malware Domain List' LIMIT 1), '{"registrar": "unknown", "created": "2024-11-01"}');

-- Insert sample file hashes
INSERT INTO iocs (ioc_type, ioc_value, threat_type, severity, confidence, source_id, metadata) VALUES
('hash', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'ransomware', 'critical', 100, (SELECT id FROM threat_sources WHERE name = 'AlienVault OTX' LIMIT 1), '{"hash_type": "md5", "file_name": "malware.exe"}'),
('hash', 'f9e8d7c6b5a4938271605f4e3d2c1b0a', 'trojan', 'high', 94, (SELECT id FROM threat_sources WHERE name = 'EmergingThreats' LIMIT 1), '{"hash_type": "md5", "file_name": "backdoor.dll"}'),
('hash', '1234567890abcdef1234567890abcdef12345678', 'spyware', 'high', 89, (SELECT id FROM threat_sources WHERE name = 'AlienVault OTX' LIMIT 1), '{"hash_type": "sha1", "file_name": "keylogger.exe"}');

-- Insert sample benign logs
INSERT INTO logs (log_type, timestamp, source_ip, destination_ip, domain, protocol, port, action, raw_log, parsed_data) VALUES
('network', now() - interval '10 minutes', '192.168.1.100', '8.8.8.8', 'google.com', 'TCP', 443, 'ALLOW', '2024-12-03 12:00:00 ALLOW TCP 192.168.1.100:54321 -> 8.8.8.8:443', '{"bytes": 1024, "packets": 5}'),
('network', now() - interval '9 minutes', '192.168.1.101', '1.1.1.1', 'cloudflare.com', 'TCP', 443, 'ALLOW', '2024-12-03 12:01:00 ALLOW TCP 192.168.1.101:54322 -> 1.1.1.1:443', '{"bytes": 2048, "packets": 8}'),
('network', now() - interval '8 minutes', '192.168.1.102', '93.184.216.34', 'example.com', 'TCP', 80, 'ALLOW', '2024-12-03 12:02:00 ALLOW TCP 192.168.1.102:54323 -> 93.184.216.34:80', '{"bytes": 512, "packets": 3}'),
('system', now() - interval '7 minutes', '192.168.1.100', NULL, NULL, NULL, NULL, 'LOGIN', '2024-12-03 12:03:00 User admin logged in successfully', '{"user": "admin", "session_id": "abc123"}');

-- Insert sample malicious logs (will trigger alerts)
INSERT INTO logs (log_type, timestamp, source_ip, destination_ip, domain, protocol, port, action, raw_log, parsed_data) VALUES
('network', now() - interval '5 minutes', '192.168.100.50', '192.168.1.10', NULL, 'TCP', 445, 'BLOCK', '2024-12-03 12:05:00 BLOCK TCP 192.168.100.50:12345 -> 192.168.1.10:445', '{"bytes": 0, "packets": 1, "reason": "suspicious"}'),
('network', now() - interval '4 minutes', '192.168.1.50', '10.0.0.99', NULL, 'TCP', 8080, 'ALLOW', '2024-12-03 12:06:00 ALLOW TCP 192.168.1.50:54400 -> 10.0.0.99:8080', '{"bytes": 5120, "packets": 20}'),
('network', now() - interval '3 minutes', '192.168.1.75', '172.16.50.100', 'c2-command.net', 'TCP', 443, 'ALLOW', '2024-12-03 12:07:00 ALLOW TCP 192.168.1.75:54401 -> 172.16.50.100:443', '{"bytes": 10240, "packets": 50}'),
('network', now() - interval '2 minutes', '192.168.1.80', '198.51.100.78', 'malicious-site.evil', 'TCP', 80, 'ALLOW', '2024-12-03 12:08:00 ALLOW TCP 192.168.1.80:54402 -> 198.51.100.78:80', '{"bytes": 2048, "packets": 10}'),
('network', now() - interval '1 minute', '203.0.113.45', '192.168.1.1', NULL, 'TCP', 22, 'BLOCK', '2024-12-03 12:09:00 BLOCK TCP 203.0.113.45:55555 -> 192.168.1.1:22', '{"bytes": 0, "packets": 1, "reason": "port_scan"}');

-- Run correlation to generate alerts
SELECT correlate_logs_with_iocs();