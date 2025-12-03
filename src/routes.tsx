import Dashboard from './pages/Dashboard';
import IOCs from './pages/IOCs';
import Alerts from './pages/Alerts';
import Logs from './pages/Logs';
import Correlation from './pages/Correlation';
import Feeds from './pages/Feeds';
import LogGenerator from './pages/LogGenerator';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
    visible: true,
  },
  {
    name: 'IOCs',
    path: '/iocs',
    element: <IOCs />,
    visible: true,
  },
  {
    name: 'Alerts',
    path: '/alerts',
    element: <Alerts />,
    visible: true,
  },
  {
    name: 'Logs',
    path: '/logs',
    element: <Logs />,
    visible: true,
  },
  {
    name: 'Correlation',
    path: '/correlation',
    element: <Correlation />,
    visible: true,
  },
  {
    name: 'Feeds',
    path: '/feeds',
    element: <Feeds />,
    visible: true,
  },
  {
    name: 'Log Generator',
    path: '/log-generator',
    element: <LogGenerator />,
    visible: true,
  },
];

export default routes;
