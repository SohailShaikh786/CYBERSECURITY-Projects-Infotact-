import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Database, 
  RefreshCw,
  TrendingUp,
  FileText,
  Zap
} from 'lucide-react';
import { api } from '@/db/api';
import type { DashboardStats } from '@/types/types';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadStats = async () => {
    setLoading(true);
    const data = await api.getDashboardStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = async () => {
    toast({
      title: 'Refreshing data...',
      description: 'Fetching latest statistics',
    });
    await loadStats();
    toast({
      title: 'Data refreshed',
      description: 'Dashboard updated successfully',
    });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Intelligence Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of security threats and anomalies
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-4 grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IOCs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total_iocs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Indicators of Compromise
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.processed_logs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats?.total_logs || 0} total logs
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total_alerts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.critical_alerts || 0} critical, {stats?.high_alerts || 0} high
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Sources</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.active_sources || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active feed sources
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Latest security threats detected</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full bg-muted" />
                      <Skeleton className="h-3 w-2/3 bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recent_alerts && stats.recent_alerts.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <div className="mt-1">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(alert.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <Link to="/alerts">
                  <Button variant="outline" className="w-full">
                    View All Alerts
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription>Current operational status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium">Threat Feed Ingestion</span>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium">Log Processing</span>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium">Correlation Engine</span>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium">Alert System</span>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Active
              </Badge>
            </div>

            <div className="pt-4">
              <Link to="/feeds">
                <Button variant="outline" className="w-full">
                  Manage Threat Feeds
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-4 grid-cols-1">
            <Link to="/iocs">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Database className="h-6 w-6" />
                <span>Browse IOCs</span>
              </Button>
            </Link>
            <Link to="/logs">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <FileText className="h-6 w-6" />
                <span>View Logs</span>
              </Button>
            </Link>
            <Link to="/correlation">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Activity className="h-6 w-6" />
                <span>Run Correlation</span>
              </Button>
            </Link>
            <Link to="/log-generator">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Zap className="h-6 w-6" />
                <span>Generate Logs</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
