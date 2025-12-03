export interface ThreatSource {
  id: string;
  name: string;
  source_type: string;
  api_endpoint: string | null;
  last_updated: string | null;
  status: string;
  total_iocs: number;
  created_at: string;
}

export interface IOC {
  id: string;
  ioc_type: 'ip' | 'domain' | 'hash';
  ioc_value: string;
  threat_type: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  source_id: string | null;
  first_seen: string;
  last_seen: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Log {
  id: string;
  log_type: 'network' | 'system' | 'application';
  timestamp: string;
  source_ip: string | null;
  destination_ip: string | null;
  domain: string | null;
  protocol: string | null;
  port: number | null;
  action: string | null;
  raw_log: string;
  parsed_data: Record<string, unknown>;
  processed: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  alert_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string | null;
  log_id: string | null;
  ioc_id: string | null;
  matched_value: string | null;
  status: 'new' | 'acknowledged' | 'resolved';
  acknowledged_at: string | null;
  resolved_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CorrelationResult {
  id: string;
  log_id: string;
  ioc_id: string;
  match_type: 'ip' | 'domain' | 'hash';
  confidence_score: number;
  created_at: string;
}

export interface DashboardStats {
  total_iocs: number;
  total_logs: number;
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  processed_logs: number;
  active_sources: number;
  recent_alerts: Array<{
    id: string;
    title: string;
    severity: string;
    created_at: string;
  }>;
}

export interface AlertWithDetails extends Alert {
  log?: Log;
  ioc?: IOC;
}

export interface IOCWithSource extends IOC {
  source?: ThreatSource;
}

export interface LogEntry {
  timestamp: string;
  source_ip?: string;
  destination_ip?: string;
  domain?: string;
  protocol?: string;
  port?: number;
  action?: string;
}
