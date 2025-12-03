import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Play, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '@/db/api';
import { useToast } from '@/hooks/use-toast';

export default function Correlation() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ processed_logs: number; matches_found: number } | null>(null);
  const { toast } = useToast();

  const runCorrelation = async () => {
    setRunning(true);
    toast({
      title: 'Starting correlation analysis',
      description: 'Processing logs and matching against IOCs...',
    });

    const data = await api.correlateLogsWithIOCs();
    
    if (data) {
      setResult(data);
      toast({
        title: 'Correlation complete',
        description: `Processed ${data.processed_logs} logs, found ${data.matches_found} matches`,
      });
    } else {
      toast({
        title: 'Correlation failed',
        description: 'An error occurred during correlation analysis',
        variant: 'destructive',
      });
    }
    
    setRunning(false);
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log-IOC Correlation Engine</h1>
        <p className="text-muted-foreground mt-2">
          Correlate network logs with threat intelligence indicators
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Correlation Analysis
          </CardTitle>
          <CardDescription>
            Run correlation analysis to match logs against known IOCs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border border-border rounded-lg bg-accent/20">
            <h3 className="font-semibold mb-4">How Correlation Works</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  The correlation engine scans all unprocessed logs in the database
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  Extracts IP addresses, domains, and other indicators from log entries
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  Compares extracted indicators against the IOC database
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  4
                </div>
                <p>
                  Creates correlation records and generates security alerts for matches
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  5
                </div>
                <p>
                  Marks processed logs to avoid duplicate analysis
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={runCorrelation}
              disabled={running}
              className="min-w-[200px]"
            >
              {running ? (
                <>
                  <Activity className="h-5 w-5 mr-2 animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Run Correlation
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Analysis Complete</span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2 grid-cols-1">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Logs Processed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{result.processed_logs}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Log entries analyzed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Matches Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{result.matches_found}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      IOC matches detected
                    </p>
                  </CardContent>
                </Card>
              </div>

              {result.matches_found > 0 && (
                <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">
                        Security Threats Detected
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.matches_found} potential security {result.matches_found === 1 ? 'threat' : 'threats'} detected.
                        New alerts have been created. Please review them in the Alerts section.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.matches_found === 0 && result.processed_logs > 0 && (
                <div className="p-4 border border-success/20 bg-success/5 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-success">
                        No Threats Detected
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        All processed logs appear to be clean. No matches found against known IOCs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Correlation Statistics</CardTitle>
          <CardDescription>Overview of correlation analysis performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm font-medium">Match Types</span>
              <span className="text-sm text-muted-foreground">IP, Domain, Hash</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm font-medium">Analysis Method</span>
              <span className="text-sm text-muted-foreground">Exact String Matching</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm font-medium">Alert Generation</span>
              <span className="text-sm text-muted-foreground">Automatic on Match</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm font-medium">Processing Status</span>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Ready
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
