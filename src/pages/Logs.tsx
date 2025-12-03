import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CheckCircle, Clock, Network, Server, Code } from 'lucide-react';
import { api } from '@/db/api';
import type { Log } from '@/types/types';

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [processedFilter, setProcessedFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, typeFilter, processedFilter]);

  const loadLogs = async () => {
    setLoading(true);
    const data = await api.getLogs();
    setLogs(data);
    setLoading(false);
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (typeFilter !== 'all') {
      filtered = filtered.filter((log) => log.log_type === typeFilter);
    }

    if (processedFilter !== 'all') {
      const isProcessed = processedFilter === 'processed';
      filtered = filtered.filter((log) => log.processed === isProcessed);
    }

    setFilteredLogs(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <Network className="h-4 w-4" />;
      case 'system':
        return <Server className="h-4 w-4" />;
      case 'application':
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const stats = {
    total: logs.length,
    network: logs.filter((l) => l.log_type === 'network').length,
    system: logs.filter((l) => l.log_type === 'system').length,
    application: logs.filter((l) => l.log_type === 'application').length,
    processed: logs.filter((l) => l.processed).length,
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Analysis</h1>
        <p className="text-muted-foreground mt-2">
          View and analyze system and network logs
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-5 grid-cols-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.network}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.system}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.application}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter logs by type and processing status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2 grid-cols-1">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="application">Application</SelectItem>
              </SelectContent>
            </Select>
            <Select value={processedFilter} onValueChange={setProcessedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="unprocessed">Unprocessed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <Skeleton className="h-4 w-full bg-muted mb-2" />
                  <Skeleton className="h-3 w-2/3 bg-muted" />
                </div>
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      {getTypeIcon(log.log_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline">{log.log_type}</Badge>
                        {log.processed ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Processed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <code className="block p-3 bg-muted rounded text-xs font-mono overflow-x-auto">
                        {log.raw_log}
                      </code>
                      {(log.source_ip || log.destination_ip || log.domain) && (
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {log.source_ip && (
                            <span>
                              <span className="font-medium">Source:</span> {log.source_ip}
                            </span>
                          )}
                          {log.destination_ip && (
                            <span>
                              <span className="font-medium">Dest:</span> {log.destination_ip}
                            </span>
                          )}
                          {log.domain && (
                            <span>
                              <span className="font-medium">Domain:</span> {log.domain}
                            </span>
                          )}
                          {log.protocol && (
                            <span>
                              <span className="font-medium">Protocol:</span> {log.protocol}
                            </span>
                          )}
                          {log.port && (
                            <span>
                              <span className="font-medium">Port:</span> {log.port}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No logs found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
