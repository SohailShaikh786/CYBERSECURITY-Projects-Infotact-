import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, CheckCircle, Clock, Globe } from 'lucide-react';
import { api } from '@/db/api';
import type { ThreatSource } from '@/types/types';

export default function Feeds() {
  const [sources, setSources] = useState<ThreatSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    const data = await api.getThreatSources();
    setSources(data);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-success/10 text-success border-success/20'
      : 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className="h-4 w-4" />
    ) : (
      <Clock className="h-4 w-4" />
    );
  };

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) {
      return 'Just now';
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const stats = {
    total: sources.length,
    active: sources.filter((s) => s.status === 'active').length,
    totalIOCs: sources.reduce((sum, s) => sum + s.total_iocs, 0),
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Threat Intelligence Feeds</h1>
        <p className="text-muted-foreground mt-2">
          Manage and monitor threat intelligence data sources
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3 grid-cols-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Active Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Total IOCs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIOCs.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feed Sources</CardTitle>
          <CardDescription>
            Threat intelligence providers and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded bg-muted" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : sources.length > 0 ? (
            <div className="space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex flex-col xl:flex-row xl:items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{source.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {source.source_type.toUpperCase()} Source
                      </div>
                      {source.api_endpoint && (
                        <div className="text-xs font-mono text-muted-foreground mt-1 truncate">
                          {source.api_endpoint}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {source.total_iocs.toLocaleString()} IOCs
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated {formatLastUpdated(source.last_updated)}
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(source.status)}>
                      <span className="mr-1">{getStatusIcon(source.status)}</span>
                      {source.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No threat intelligence sources configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supported Feed Types</CardTitle>
          <CardDescription>
            Types of threat intelligence feeds integrated into the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2 grid-cols-1">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">API-Based Feeds</h3>
              <p className="text-sm text-muted-foreground">
                Real-time threat intelligence via REST APIs (AlienVault OTX, AbuseIPDB)
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">File-Based Feeds</h3>
              <p className="text-sm text-muted-foreground">
                Downloadable threat lists and blocklists (Malware Domain List, EmergingThreats)
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">IOC Types</h3>
              <p className="text-sm text-muted-foreground">
                IP addresses, domains, file hashes (MD5, SHA1, SHA256)
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Update Frequency</h3>
              <p className="text-sm text-muted-foreground">
                Hourly updates for critical feeds, daily for comprehensive lists
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
