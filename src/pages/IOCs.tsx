import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Database, Globe, Hash, Server } from 'lucide-react';
import { api } from '@/db/api';
import type { IOCWithSource } from '@/types/types';

export default function IOCs() {
  const [iocs, setIocs] = useState<IOCWithSource[]>([]);
  const [filteredIocs, setFilteredIocs] = useState<IOCWithSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    loadIOCs();
  }, []);

  useEffect(() => {
    filterIOCs();
  }, [iocs, searchTerm, typeFilter, severityFilter]);

  const loadIOCs = async () => {
    setLoading(true);
    const data = await api.getIOCs();
    setIocs(data);
    setLoading(false);
  };

  const filterIOCs = () => {
    let filtered = [...iocs];

    if (searchTerm) {
      filtered = filtered.filter((ioc) =>
        ioc.ioc_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ioc.threat_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((ioc) => ioc.ioc_type === typeFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((ioc) => ioc.severity === severityFilter);
    }

    setFilteredIocs(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-critical text-white';
      case 'high':
        return 'bg-high text-white';
      case 'medium':
        return 'bg-medium text-foreground';
      case 'low':
        return 'bg-low text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip':
        return <Server className="h-4 w-4" />;
      case 'domain':
        return <Globe className="h-4 w-4" />;
      case 'hash':
        return <Hash className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const stats = {
    total: iocs.length,
    ip: iocs.filter((i) => i.ioc_type === 'ip').length,
    domain: iocs.filter((i) => i.ioc_type === 'domain').length,
    hash: iocs.filter((i) => i.ioc_type === 'hash').length,
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Indicators of Compromise</h1>
        <p className="text-muted-foreground mt-2">
          Browse and search threat intelligence indicators
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4 grid-cols-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total IOCs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              IP Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ip}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.domain}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" />
              File Hashes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hash}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Search and filter IOCs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-3 grid-cols-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search IOCs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="hash">File Hash</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IOC Database</CardTitle>
          <CardDescription>
            Showing {filteredIocs.length} of {iocs.length} indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded bg-muted" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredIocs.length > 0 ? (
            <div className="space-y-3">
              {filteredIocs.map((ioc) => (
                <div
                  key={ioc.id}
                  className="flex flex-col xl:flex-row xl:items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                      {getTypeIcon(ioc.ioc_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-medium break-all">
                        {ioc.ioc_value}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {ioc.ioc_type}
                        </Badge>
                        {ioc.threat_type && (
                          <Badge variant="outline" className="text-xs">
                            {ioc.threat_type}
                          </Badge>
                        )}
                        {ioc.source && (
                          <span className="text-xs text-muted-foreground">
                            Source: {ioc.source.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Confidence: {ioc.confidence}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ioc.first_seen).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={getSeverityColor(ioc.severity)}>
                      {ioc.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No IOCs found matching your filters</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setSeverityFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
