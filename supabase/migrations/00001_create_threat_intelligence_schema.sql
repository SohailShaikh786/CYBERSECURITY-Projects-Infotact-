/*
# Create Threat Intelligence Database Schema

## 1. New Tables

### threat_sources
Stores information about threat intelligence feed sources
- `id` (uuid, primary key)
- `name` (text, unique, not null) - Source name (e.g., "AlienVault OTX", "AbuseIPDB")
- `source_type` (text, not null) - Type of source
- `api_endpoint` (text) - API endpoint URL
- `last_updated` (timestamptz) - Last successful update
- `status` (text, default: 'active') - Source status
- `total_iocs` (integer, default: 0) - Total IOCs from this source
- `created_at` (timestamptz, default: now())

### iocs
Stores Indicators of Compromise from threat feeds
- `id` (uuid, primary key)
- `ioc_type` (text, not null) - Type: 'ip', 'domain', 'hash'
- `ioc_value` (text, not null) - The actual IOC value
- `threat_type` (text) - Type of threat (malware, phishing, etc.)
- `severity` (text, default: 'medium') - Severity level
- `confidence` (integer, default: 50) - Confidence score 0-100
- `source_id` (uuid, references threat_sources)
- `first_seen` (timestamptz, default: now())
- `last_seen` (timestamptz, default: now())
- `metadata` (jsonb) - Additional metadata
- `created_at` (timestamptz, default: now())

### logs
Stores system and network logs for analysis
- `id` (uuid, primary key)
- `log_type` (text, not null) - Type: 'network', 'system', 'application'
- `timestamp` (timestamptz, not null)
- `source_ip` (text)
- `destination_ip` (text)
- `domain` (text)
- `protocol` (text)
- `port` (integer)
- `action` (text)
- `raw_log` (text, not null) - Original log entry
- `parsed_data` (jsonb) - Parsed log data
- `processed` (boolean, default: false)
- `created_at` (timestamptz, default: now())

### alerts
Stores detected anomalies and security alerts
- `id` (uuid, primary key)
- `alert_type` (text, not null) - Type of alert
- `severity` (text, not null) - critical, high, medium, low
- `title` (text, not null)
- `description` (text)
- `log_id` (uuid, references logs)
- `ioc_id` (uuid, references iocs)
- `matched_value` (text) - The value that matched
- `status` (text, default: 'new') - new, acknowledged, resolved
- `acknowledged_at` (timestamptz)
- `resolved_at` (timestamptz)
- `metadata` (jsonb)
- `created_at` (timestamptz, default: now())

### correlation_results
Stores results of log-IOC correlation analysis
- `id` (uuid, primary key)
- `log_id` (uuid, references logs)
- `ioc_id` (uuid, references iocs)
- `match_type` (text, not null) - ip, domain, hash
- `confidence_score` (integer, default: 0)
- `created_at` (timestamptz, default: now())

## 2. Security
- No RLS enabled - public access for demonstration
- All tables are publicly readable and writable for demo purposes

## 3. Indexes
- Create indexes on frequently queried fields for performance

## 4. RPC Functions
- `correlate_logs_with_iocs()` - Performs correlation analysis
- `get_dashboard_stats()` - Returns dashboard statistics
*/

-- Create threat_sources table
CREATE TABLE IF NOT EXISTS threat_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  source_type text NOT NULL,
  api_endpoint text,
  last_updated timestamptz,
  status text DEFAULT 'active',
  total_iocs integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create iocs table
CREATE TABLE IF NOT EXISTS iocs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ioc_type text NOT NULL CHECK (ioc_type IN ('ip', 'domain', 'hash')),
  ioc_value text NOT NULL,
  threat_type text,
  severity text DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  confidence integer DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  source_id uuid REFERENCES threat_sources(id) ON DELETE SET NULL,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index on ioc_value for fast lookups
CREATE INDEX IF NOT EXISTS idx_iocs_value ON iocs(ioc_value);
CREATE INDEX IF NOT EXISTS idx_iocs_type ON iocs(ioc_type);
CREATE INDEX IF NOT EXISTS idx_iocs_severity ON iocs(severity);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type text NOT NULL CHECK (log_type IN ('network', 'system', 'application')),
  timestamp timestamptz NOT NULL,
  source_ip text,
  destination_ip text,
  domain text,
  protocol text,
  port integer,
  action text,
  raw_log text NOT NULL,
  parsed_data jsonb DEFAULT '{}'::jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes on logs
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_source_ip ON logs(source_ip);
CREATE INDEX IF NOT EXISTS idx_logs_destination_ip ON logs(destination_ip);
CREATE INDEX IF NOT EXISTS idx_logs_domain ON logs(domain);
CREATE INDEX IF NOT EXISTS idx_logs_processed ON logs(processed);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title text NOT NULL,
  description text,
  log_id uuid REFERENCES logs(id) ON DELETE CASCADE,
  ioc_id uuid REFERENCES iocs(id) ON DELETE SET NULL,
  matched_value text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes on alerts
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Create correlation_results table
CREATE TABLE IF NOT EXISTS correlation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid REFERENCES logs(id) ON DELETE CASCADE,
  ioc_id uuid REFERENCES iocs(id) ON DELETE CASCADE,
  match_type text NOT NULL CHECK (match_type IN ('ip', 'domain', 'hash')),
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at timestamptz DEFAULT now()
);

-- Create indexes on correlation_results
CREATE INDEX IF NOT EXISTS idx_correlation_log_id ON correlation_results(log_id);
CREATE INDEX IF NOT EXISTS idx_correlation_ioc_id ON correlation_results(ioc_id);

-- RPC function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_iocs', (SELECT COUNT(*) FROM iocs),
    'total_logs', (SELECT COUNT(*) FROM logs),
    'total_alerts', (SELECT COUNT(*) FROM alerts),
    'critical_alerts', (SELECT COUNT(*) FROM alerts WHERE severity = 'critical' AND status = 'new'),
    'high_alerts', (SELECT COUNT(*) FROM alerts WHERE severity = 'high' AND status = 'new'),
    'processed_logs', (SELECT COUNT(*) FROM logs WHERE processed = true),
    'active_sources', (SELECT COUNT(*) FROM threat_sources WHERE status = 'active'),
    'recent_alerts', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'title', a.title,
          'severity', a.severity,
          'created_at', a.created_at
        )
      )
      FROM (
        SELECT id, title, severity, created_at
        FROM alerts
        WHERE status = 'new'
        ORDER BY created_at DESC
        LIMIT 5
      ) a
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- RPC function to correlate logs with IOCs
CREATE OR REPLACE FUNCTION correlate_logs_with_iocs()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  processed_count integer := 0;
  matched_count integer := 0;
  log_record RECORD;
  ioc_record RECORD;
BEGIN
  -- Process unprocessed logs
  FOR log_record IN 
    SELECT * FROM logs WHERE processed = false
  LOOP
    -- Check source IP against IOCs
    IF log_record.source_ip IS NOT NULL THEN
      FOR ioc_record IN 
        SELECT * FROM iocs WHERE ioc_type = 'ip' AND ioc_value = log_record.source_ip
      LOOP
        -- Create correlation result
        INSERT INTO correlation_results (log_id, ioc_id, match_type, confidence_score)
        VALUES (log_record.id, ioc_record.id, 'ip', ioc_record.confidence);
        
        -- Create alert
        INSERT INTO alerts (
          alert_type, severity, title, description, log_id, ioc_id, matched_value
        ) VALUES (
          'ioc_match',
          ioc_record.severity,
          'Malicious IP Detected',
          'Source IP ' || log_record.source_ip || ' matches known threat indicator',
          log_record.id,
          ioc_record.id,
          log_record.source_ip
        );
        
        matched_count := matched_count + 1;
      END LOOP;
    END IF;
    
    -- Check destination IP against IOCs
    IF log_record.destination_ip IS NOT NULL THEN
      FOR ioc_record IN 
        SELECT * FROM iocs WHERE ioc_type = 'ip' AND ioc_value = log_record.destination_ip
      LOOP
        INSERT INTO correlation_results (log_id, ioc_id, match_type, confidence_score)
        VALUES (log_record.id, ioc_record.id, 'ip', ioc_record.confidence);
        
        INSERT INTO alerts (
          alert_type, severity, title, description, log_id, ioc_id, matched_value
        ) VALUES (
          'ioc_match',
          ioc_record.severity,
          'Connection to Malicious IP',
          'Destination IP ' || log_record.destination_ip || ' matches known threat indicator',
          log_record.id,
          ioc_record.id,
          log_record.destination_ip
        );
        
        matched_count := matched_count + 1;
      END LOOP;
    END IF;
    
    -- Check domain against IOCs
    IF log_record.domain IS NOT NULL THEN
      FOR ioc_record IN 
        SELECT * FROM iocs WHERE ioc_type = 'domain' AND ioc_value = log_record.domain
      LOOP
        INSERT INTO correlation_results (log_id, ioc_id, match_type, confidence_score)
        VALUES (log_record.id, ioc_record.id, 'domain', ioc_record.confidence);
        
        INSERT INTO alerts (
          alert_type, severity, title, description, log_id, ioc_id, matched_value
        ) VALUES (
          'ioc_match',
          ioc_record.severity,
          'Malicious Domain Detected',
          'Domain ' || log_record.domain || ' matches known threat indicator',
          log_record.id,
          ioc_record.id,
          log_record.domain
        );
        
        matched_count := matched_count + 1;
      END LOOP;
    END IF;
    
    -- Mark log as processed
    UPDATE logs SET processed = true WHERE id = log_record.id;
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'processed_logs', processed_count,
    'matches_found', matched_count
  );
END;
$$;