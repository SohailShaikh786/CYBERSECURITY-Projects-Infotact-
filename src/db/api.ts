import { supabase } from './supabase';
import type {
  ThreatSource,
  IOC,
  Log,
  Alert,
  CorrelationResult,
  DashboardStats,
  AlertWithDetails,
  IOCWithSource,
} from '@/types/types';

export const api = {
  async getDashboardStats(): Promise<DashboardStats | null> {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
    return data as DashboardStats;
  },

  async getThreatSources(): Promise<ThreatSource[]> {
    const { data, error } = await supabase
      .from('threat_sources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching threat sources:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  },

  async getIOCs(filters?: {
    type?: string;
    severity?: string;
    limit?: number;
  }): Promise<IOCWithSource[]> {
    let query = supabase
      .from('iocs')
      .select(`
        *,
        source:threat_sources(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('ioc_type', filters.type);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching IOCs:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  },

  async searchIOCs(searchTerm: string): Promise<IOCWithSource[]> {
    const { data, error } = await supabase
      .from('iocs')
      .select(`
        *,
        source:threat_sources(*)
      `)
      .ilike('ioc_value', `%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error searching IOCs:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  },

  async getLogs(filters?: {
    type?: string;
    processed?: boolean;
    limit?: number;
  }): Promise<Log[]> {
    let query = supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters?.type) {
      query = query.eq('log_type', filters.type);
    }
    if (filters?.processed !== undefined) {
      query = query.eq('processed', filters.processed);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  },

  async getAlerts(filters?: {
    severity?: string;
    status?: string;
    limit?: number;
  }): Promise<AlertWithDetails[]> {
    let query = supabase
      .from('alerts')
      .select(`
        *,
        log:logs(*),
        ioc:iocs(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  },

  async getAlertById(id: string): Promise<AlertWithDetails | null> {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        log:logs(*),
        ioc:iocs(*)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching alert:', error);
      return null;
    }
    return data;
  },

  async updateAlertStatus(
    id: string,
    status: 'new' | 'acknowledged' | 'resolved'
  ): Promise<boolean> {
    const updates: Partial<Alert> = { status };
    
    if (status === 'acknowledged') {
      updates.acknowledged_at = new Date().toISOString();
    } else if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating alert status:', error);
      return false;
    }
    return true;
  },

  async createLog(log: Omit<Log, 'id' | 'created_at' | 'processed'>): Promise<Log | null> {
    const { data, error } = await supabase
      .from('logs')
      .insert([log])
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating log:', error);
      return null;
    }
    return data;
  },

  async correlateLogsWithIOCs(): Promise<{ processed_logs: number; matches_found: number } | null> {
    const { data, error } = await supabase.rpc('correlate_logs_with_iocs');
    
    if (error) {
      console.error('Error correlating logs:', error);
      return null;
    }
    return data;
  },

  async getCorrelationResults(logId?: string): Promise<CorrelationResult[]> {
    let query = supabase
      .from('correlation_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (logId) {
      query = query.eq('log_id', logId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching correlation results:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  },

  async getIOCStats(): Promise<{
    by_type: Record<string, number>;
    by_severity: Record<string, number>;
  }> {
    const { data: iocs } = await supabase
      .from('iocs')
      .select('ioc_type, severity');

    if (!iocs) {
      return { by_type: {}, by_severity: {} };
    }

    const by_type: Record<string, number> = {};
    const by_severity: Record<string, number> = {};

    iocs.forEach((ioc) => {
      by_type[ioc.ioc_type] = (by_type[ioc.ioc_type] || 0) + 1;
      by_severity[ioc.severity] = (by_severity[ioc.severity] || 0) + 1;
    });

    return { by_type, by_severity };
  },
};

export default api;
