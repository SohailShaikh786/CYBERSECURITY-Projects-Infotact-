import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import type { Log } from '@/types/types';

export default function LogGenerator() {
  const [generating, setGenerating] = useState(false);
  const [logType, setLogType] = useState<'network' | 'system' | 'application'>('network');
  const [count, setCount] = useState(5);
  const [includeMalicious, setIncludeMalicious] = useState(true);
  const [generatedLogs, setGeneratedLogs] = useState<Log[]>([]);
  const { toast } = useToast();

  const maliciousIPs = [
    '192.168.100.50',
    '10.0.0.99',
    '172.16.50.100',
    '203.0.113.45',
    '198.51.100.78',
  ];

  const maliciousDomains = [
    'malicious-site.evil',
    'bad-actor.com',
    'c2-command.net',
    'fake-bank-login.org',
  ];

  const benignIPs = [
    '8.8.8.8',
    '1.1.1.1',
    '93.184.216.34',
    '192.168.1.100',
    '192.168.1.101',
  ];

  const benignDomains = [
    'google.com',
    'cloudflare.com',
    'example.com',
    'github.com',
    'stackoverflow.com',
  ];

  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS'];
  const ports = [80, 443, 22, 3389, 8080, 445];
  const actions = ['ALLOW', 'BLOCK', 'DROP'];

  const generateNetworkLog = (isMalicious: boolean): Omit<Log, 'id' | 'created_at' | 'processed'> => {
    const timestamp = new Date(Date.now() - Math.random() * 3600000).toISOString();
    const sourceIP = isMalicious
      ? maliciousIPs[Math.floor(Math.random() * maliciousIPs.length)]
      : benignIPs[Math.floor(Math.random() * benignIPs.length)];
    const destIP = benignIPs[Math.floor(Math.random() * benignIPs.length)];
    const domain = isMalicious
      ? maliciousDomains[Math.floor(Math.random() * maliciousDomains.length)]
      : benignDomains[Math.floor(Math.random() * benignDomains.length)];
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const port = ports[Math.floor(Math.random() * ports.length)];
    const action = isMalicious ? (Math.random() > 0.5 ? 'BLOCK' : 'ALLOW') : 'ALLOW';

    const rawLog = `${new Date(timestamp).toISOString().replace('T', ' ').split('.')[0]} ${action} ${protocol} ${sourceIP}:${Math.floor(Math.random() * 60000 + 1024)} -> ${destIP}:${port}`;

    return {
      log_type: 'network',
      timestamp,
      source_ip: sourceIP,
      destination_ip: destIP,
      domain: Math.random() > 0.5 ? domain : null,
      protocol,
      port,
      action,
      raw_log: rawLog,
      parsed_data: {
        bytes: Math.floor(Math.random() * 10000),
        packets: Math.floor(Math.random() * 100),
      },
    };
  };

  const generateSystemLog = (isMalicious: boolean): Omit<Log, 'id' | 'created_at' | 'processed'> => {
    const timestamp = new Date(Date.now() - Math.random() * 3600000).toISOString();
    const users = ['admin', 'user', 'root', 'system'];
    const user = users[Math.floor(Math.random() * users.length)];
    const actions = isMalicious
      ? ['Failed login attempt', 'Unauthorized access', 'Privilege escalation']
      : ['User logged in', 'Service started', 'Configuration updated'];
    const action = actions[Math.floor(Math.random() * actions.length)];

    const rawLog = `${new Date(timestamp).toISOString().replace('T', ' ').split('.')[0]} ${action} for user ${user}`;

    return {
      log_type: 'system',
      timestamp,
      source_ip: benignIPs[Math.floor(Math.random() * benignIPs.length)],
      destination_ip: null,
      domain: null,
      protocol: null,
      port: null,
      action,
      raw_log: rawLog,
      parsed_data: {
        user,
        session_id: Math.random().toString(36).substring(7),
      },
    };
  };

  const generateApplicationLog = (isMalicious: boolean): Omit<Log, 'id' | 'created_at' | 'processed'> => {
    const timestamp = new Date(Date.now() - Math.random() * 3600000).toISOString();
    const apps = ['web-server', 'database', 'api-gateway', 'auth-service'];
    const app = apps[Math.floor(Math.random() * apps.length)];
    const levels = isMalicious ? ['ERROR', 'CRITICAL'] : ['INFO', 'DEBUG', 'WARN'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const messages = isMalicious
      ? ['SQL injection attempt detected', 'Buffer overflow detected', 'Malicious payload blocked']
      : ['Request processed successfully', 'Cache updated', 'Connection established'];
    const message = messages[Math.floor(Math.random() * messages.length)];

    const rawLog = `${new Date(timestamp).toISOString().replace('T', ' ').split('.')[0]} [${level}] ${app}: ${message}`;

    return {
      log_type: 'application',
      timestamp,
      source_ip: null,
      destination_ip: null,
      domain: null,
      protocol: null,
      port: null,
      action: level,
      raw_log: rawLog,
      parsed_data: {
        application: app,
        level,
        message,
      },
    };
  };

  const generateLogs = async () => {
    setGenerating(true);
    const logs: Log[] = [];

    for (let i = 0; i < count; i++) {
      const isMalicious = includeMalicious && Math.random() > 0.6;
      let logData;

      switch (logType) {
        case 'network':
          logData = generateNetworkLog(isMalicious);
          break;
        case 'system':
          logData = generateSystemLog(isMalicious);
          break;
        case 'application':
          logData = generateApplicationLog(isMalicious);
          break;
      }

      const created = await api.createLog(logData);
      if (created) {
        logs.push(created);
      }
    }

    setGeneratedLogs(logs);
    setGenerating(false);

    toast({
      title: 'Logs generated',
      description: `Successfully generated ${logs.length} ${logType} log entries`,
    });
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Simulated Log Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate realistic network, system, and application logs for testing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Log Generation Settings
          </CardTitle>
          <CardDescription>
            Configure the type and quantity of logs to generate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2 grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="log-type">Log Type</Label>
              <Select value={logType} onValueChange={(value: 'network' | 'system' | 'application') => setLogType(value)}>
                <SelectTrigger id="log-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="network">Network Logs</SelectItem>
                  <SelectItem value="system">System Logs</SelectItem>
                  <SelectItem value="application">Application Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of Logs</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Number.parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="malicious"
              checked={includeMalicious}
              onChange={(e) => setIncludeMalicious(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="malicious" className="cursor-pointer">
              Include malicious indicators (for testing detection)
            </Label>
          </div>

          <Button
            size="lg"
            onClick={generateLogs}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Zap className="h-5 w-5 mr-2 animate-pulse" />
                Generating Logs...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Generate Logs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Generated Logs
            </CardTitle>
            <CardDescription>
              {generatedLogs.length} log {generatedLogs.length === 1 ? 'entry' : 'entries'} created successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedLogs.map((log) => {
                const isMalicious =
                  (log.source_ip && maliciousIPs.includes(log.source_ip)) ||
                  (log.destination_ip && maliciousIPs.includes(log.destination_ip)) ||
                  (log.domain && maliciousDomains.includes(log.domain));

                return (
                  <div
                    key={log.id}
                    className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline">{log.log_type}</Badge>
                          {isMalicious && (
                            <Badge className="bg-destructive text-white">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Malicious Indicator
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <code className="block p-3 bg-muted rounded text-xs font-mono overflow-x-auto">
                          {log.raw_log}
                        </code>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log Generation Features</CardTitle>
          <CardDescription>
            Capabilities of the simulated log generator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2 grid-cols-1">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Realistic Data</h3>
              <p className="text-sm text-muted-foreground">
                Generates logs with realistic timestamps, IP addresses, and protocols
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Malicious Indicators</h3>
              <p className="text-sm text-muted-foreground">
                Includes known malicious IPs and domains from the IOC database
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Multiple Log Types</h3>
              <p className="text-sm text-muted-foreground">
                Supports network, system, and application log formats
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Testing & Validation</h3>
              <p className="text-sm text-muted-foreground">
                Perfect for testing correlation engine and alert generation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
