import React, { useState, useEffect } from 'react';
import { Activity, Server, Globe, Wifi, WifiOff, AlertTriangle, Shield, ShieldAlert, Terminal, Cpu, Network } from 'lucide-react';

interface Connection {
  id: string;
  protocol: 'TCP' | 'UDP';
  localAddress: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
  state: 'ESTABLISHED' | 'LISTENING' | 'CLOSED';
  timestamp: Date;
}

interface SecurityWarning {
  level: 'high' | 'medium' | 'low';
  message: string;
  recommendation: string;
  timestamp: Date;
}

const commonPorts = {
  20: { service: 'FTP Data', secure: false },
  21: { service: 'FTP Control', secure: false },
  22: { service: 'SSH', secure: true },
  23: { service: 'Telnet', secure: false },
  25: { service: 'SMTP', secure: false },
  53: { service: 'DNS', secure: false },
  80: { service: 'HTTP', secure: false },
  443: { service: 'HTTPS', secure: true },
  3306: { service: 'MySQL', secure: false },
  3389: { service: 'RDP', secure: false },
  5432: { service: 'PostgreSQL', secure: false },
};

function App() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stats, setStats] = useState({
    established: 0,
    listening: 0,
    closed: 0
  });
  const [securityWarnings, setSecurityWarnings] = useState<SecurityWarning[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const checkSecurity = (connections: Connection[]) => {
    const warnings: SecurityWarning[] = [];
    const timestamp = new Date();

    connections.forEach(conn => {
      const remotePortInfo = commonPorts[conn.remotePort as keyof typeof commonPorts];
      if (remotePortInfo && !remotePortInfo.secure) {
        warnings.push({
          level: 'high',
          message: `检测到不安全的${remotePortInfo.service}连接 (端口 ${conn.remotePort})`,
          recommendation: `建议使用加密的替代方案，例如：${remotePortInfo.service === 'FTP' ? 'SFTP' : 
            remotePortInfo.service === 'HTTP' ? 'HTTPS' : 
            '加密版本的' + remotePortInfo.service}`,
          timestamp
        });
      }

      if (conn.state === 'LISTENING' && conn.localPort < 1024) {
        warnings.push({
          level: 'medium',
          message: `特权端口${conn.localPort}正在监听`,
          recommendation: '如非必要，建议使用1024以上的非特权端口',
          timestamp
        });
      }

      if (!conn.remoteAddress.startsWith('192.168.') && 
          !conn.remoteAddress.startsWith('10.') && 
          !conn.remoteAddress.startsWith('172.')) {
        warnings.push({
          level: 'medium',
          message: `检测到来自公网地址的连接：${conn.remoteAddress}`,
          recommendation: '确保已启用防火墙并仅开放必要端口',
          timestamp
        });
      }
    });

    setSecurityWarnings(prev => [...warnings]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const generateMockConnections = () => {
      const protocols: ('TCP' | 'UDP')[] = ['TCP', 'UDP'];
      const states: ('ESTABLISHED' | 'LISTENING' | 'CLOSED')[] = [
        'ESTABLISHED',
        'LISTENING',
        'CLOSED'
      ];

      const newConnections: Connection[] = Array(5)
        .fill(null)
        .map((_, index) => ({
          id: `conn-${index}`,
          protocol: protocols[Math.floor(Math.random() * protocols.length)],
          localAddress: '127.0.0.1',
          localPort: Math.floor(Math.random() * 60000) + 1024,
          remoteAddress: Math.random() > 0.7 ? 
            '203.0.113.' + Math.floor(Math.random() * 255) : 
            '192.168.1.' + Math.floor(Math.random() * 255),
          remotePort: Math.random() > 0.8 ? 
            [21, 23, 80, 3306][Math.floor(Math.random() * 4)] : 
            Math.floor(Math.random() * 60000) + 1024,
          state: states[Math.floor(Math.random() * states.length)],
          timestamp: new Date()
        }));

      setConnections(newConnections);
      checkSecurity(newConnections);
      
      const stats = newConnections.reduce(
        (acc, conn) => {
          acc[conn.state.toLowerCase() as keyof typeof acc]++;
          return acc;
        },
        { established: 0, listening: 0, closed: 0 }
      );
      setStats(stats);
    };

    generateMockConnections();
    const interval = setInterval(generateMockConnections, 5000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStateText = (state: string) => {
    switch (state) {
      case 'ESTABLISHED':
        return '已建立';
      case 'LISTENING':
        return '监听中';
      case 'CLOSED':
        return '已关闭';
      default:
        return state;
    }
  };

  return (
    <div className="min-h-screen cyber-bg text-cyan-400">
      <div className="container mx-auto px-4 py-8 cyber-scanline">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="h-8 w-8 cyber-text cyber-blink" />
            <h1 className="text-3xl font-bold cyber-text">网络安全监控系统</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="cyber-text text-sm">
              系统时间: {currentTime.toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-6 w-6 text-green-400 cyber-blink" />
              ) : (
                <WifiOff className="h-6 w-6 text-red-400 cyber-blink" />
              )}
              <span className={isOnline ? "text-green-400" : "text-red-400"}>
                {isOnline ? "系统在线" : "系统离线"}
              </span>
            </div>
          </div>
        </div>

        {securityWarnings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-6 w-6 text-red-400 cyber-blink" />
              <h2 className="text-xl font-semibold cyber-text">安全威胁告警</h2>
            </div>
            <div className="space-y-4">
              {securityWarnings.map((warning, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg ${
                    warning.level === 'high' 
                      ? 'cyber-warning' 
                      : 'cyber-warning-medium'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      warning.level === 'high' 
                        ? 'text-red-400' 
                        : 'text-orange-400'
                    } cyber-blink`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium cyber-text">{warning.message}</p>
                        <span className="text-xs opacity-50">
                          {warning.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm opacity-80">建议：{warning.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="cyber-card p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-400 cyber-blink" />
              <h3 className="font-semibold cyber-text">活动连接</h3>
            </div>
            <p className="text-2xl font-bold cyber-text">{stats.established}</p>
          </div>
          <div className="cyber-card p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Network className="h-5 w-5 text-blue-400 cyber-blink" />
              <h3 className="font-semibold cyber-text">监听端口</h3>
            </div>
            <p className="text-2xl font-bold cyber-text">{stats.listening}</p>
          </div>
          <div className="cyber-card p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-5 w-5 text-gray-400 cyber-blink" />
              <h3 className="font-semibold cyber-text">已关闭</h3>
            </div>
            <p className="text-2xl font-bold cyber-text">{stats.closed}</p>
          </div>
        </div>

        <div className="cyber-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full cyber-table">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                    协议
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                    本地地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                    远程地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                    时间
                  </th>
                </tr>
              </thead>
              <tbody>
                {connections.map((conn) => (
                  <tr key={conn.id} className="hover:bg-cyan-900/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {conn.protocol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {`${conn.localAddress}:${conn.localPort}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {`${conn.remoteAddress}:${conn.remotePort}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          conn.state === 'ESTABLISHED'
                            ? 'bg-green-900/50 text-green-400'
                            : conn.state === 'LISTENING'
                            ? 'bg-blue-900/50 text-blue-400'
                            : 'bg-gray-900/50 text-gray-400'
                        }`}
                      >
                        {getStateText(conn.state)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {conn.timestamp.toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;