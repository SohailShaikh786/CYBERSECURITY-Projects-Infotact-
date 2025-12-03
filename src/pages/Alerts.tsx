import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, Clock, Shield, XCircle } from 'lucide-react';
import { api } from '@/db/api';
import type { AlertWithDetails } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertWithDetails[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertWithDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, severityFilter, statusFilter]);

  const loadAlerts = async () => {
    setLoading(true);
    const data = await api.getAlerts();
    setAlerts(data);
    setLoading(false);
  };

  const filterAlerts = () => {
    let filtered = [...alerts];

    if (severityFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.status === statusFilter);
    }

    setFilteredAlerts(filtered);
  };

  const handleStatusChange = async (alertId: string, newStatus: 'new' | 'acknowledged' | 'resolved') => {
    const success = await api.updateAlertStatus(alertId, newStatus);
    if (success) {
      toast({
        title: 'Alert updated',
        description: `Alert status changed to ${newStatus}`,
      });
      await loadAlerts();
      if (selectedAlert?.id === alertId) {
        const updated = await api.getAlertById(alertId);
        setSelectedAlert(updated);
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update alert status',
        variant: 'destructive',
      });
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertTriangle className="h-4 w-4" />;
      case 'acknowledged':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'acknowledged':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const stats = {
    total: alerts.length,
    new: alerts.filter((a) => a.status === 'new').length,
    acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage detected security threats
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4 grid-cols-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Acknowledged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acknowledged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter alerts by severity and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2 grid-cols-1">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert List</CardTitle>
          <CardDescription>
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded bg-muted" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col xl:flex-row xl:items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedAlert(alert);
                    setDialogOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </div>
                      {alert.matched_value && (
                        <div className="text-xs font-mono text-muted-foreground mt-1">
                          Matched: {alert.matched_value}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(alert.status)}>
                      <span className="mr-1">{getStatusIcon(alert.status)}</span>
                      {alert.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No alerts found matching your filters</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSeverityFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Alert Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this security alert
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getSeverityColor(selectedAlert.severity)}>
                  {selectedAlert.severity}
                </Badge>
                <Badge variant="outline" className={getStatusColor(selectedAlert.status)}>
                  {selectedAlert.status}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Title</h3>
                <p>{selectedAlert.title}</p>
              </div>

              {selectedAlert.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
                </div>
              )}

              {selectedAlert.matched_value && (
                <div>
                  <h3 className="font-semibold mb-2">Matched Value</h3>
                  <code className="block p-2 bg-muted rounded text-sm font-mono">
                    {selectedAlert.matched_value}
                  </code>
                </div>
              )}

              {selectedAlert.log && (
                <div>
                  <h3 className="font-semibold mb-2">Associated Log</h3>
                  <code className="block p-2 bg-muted rounded text-xs font-mono overflow-x-auto">
                    {selectedAlert.log.raw_log}
                  </code>
                </div>
              )}

              {selectedAlert.ioc && (
                <div>
                  <h3 className="font-semibold mb-2">Related IOC</h3>
                  <div className="p-3 bg-muted rounded space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Type:</span> {selectedAlert.ioc.ioc_type}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Value:</span>{' '}
                      <code className="font-mono">{selectedAlert.ioc.ioc_value}</code>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Threat:</span> {selectedAlert.ioc.threat_type}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(selectedAlert.created_at).toLocaleString()}
                </div>
                {selectedAlert.acknowledged_at && (
                  <div>
                    <span className="font-medium">Acknowledged:</span>{' '}
                    {new Date(selectedAlert.acknowledged_at).toLocaleString()}
                  </div>
                )}
                {selectedAlert.resolved_at && (
                  <div>
                    <span className="font-medium">Resolved:</span>{' '}
                    {new Date(selectedAlert.resolved_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                {selectedAlert.status === 'new' && (
                  <Button
                    onClick={() => handleStatusChange(selectedAlert.id, 'acknowledged')}
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Acknowledge
                  </Button>
                )}
                {(selectedAlert.status === 'new' || selectedAlert.status === 'acknowledged') && (
                  <Button
                    onClick={() => handleStatusChange(selectedAlert.id, 'resolved')}
                    variant="outline"
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                )}
                {selectedAlert.status === 'resolved' && (
                  <Button
                    onClick={() => handleStatusChange(selectedAlert.id, 'new')}
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reopen
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
