import { useEffect, useState } from 'react';
import { Activity, Cpu, LayoutDashboard, MessageSquareText, Orbit, type LucideIcon } from 'lucide-react';
import appManifest from '../app/routes.json';
import { UI_CONFIG } from '@/config/core';
import RyanAICockpit from '@/components/dashboard/RyanAICockpit';
import CommandCenter from '@/pages/CommandCenter';
import DashboardPage from '@/pages/Dashboard';
import LandingPage from '@/pages/LandingPage';

type Route = (typeof appManifest.routes)[number]['id'];

const routeFromHash = (): Route => {
  const route = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  return appManifest.routes.find((candidate) => candidate.id === route)?.id ?? UI_CONFIG.defaultRoute;
};

const routeIcons: Record<Route, LucideIcon> = {
  landing: Orbit,
  dashboard: LayoutDashboard,
  cockpit: Cpu,
  workspace: MessageSquareText,
};

const destinations = appManifest.routes.map((route) => ({
  ...route,
  icon: routeIcons[route.id],
}));

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash);

  useEffect(() => {
    const syncRoute = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  return (
    <div className="flex h-screen min-h-[480px] flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="z-20 flex min-h-14 items-center justify-between border-b border-cyan-400/15 bg-slate-950/95 px-4 sm:px-8">
        <a href="#/" className="flex items-center gap-2 font-display text-sm font-black tracking-[0.18em] text-cyan-200">
          <Cpu className="h-5 w-5 text-cyan-400" />
          RYANAI
        </a>
        <nav aria-label="Main navigation" className="flex items-center gap-1 overflow-x-auto">
          {destinations.map(({ id, path, label, icon: Icon }) => (
            <a
              key={id}
              href={id === 'landing' ? '#/' : `#${path}`}
              aria-current={route === id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                route === id ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </a>
          ))}
        </nav>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        {route === 'landing' && <LandingPage />}
        {route === 'dashboard' && <DashboardPage />}
        {route === 'cockpit' && <RyanAICockpit />}
        {route === 'workspace' && (
          <div className="h-full min-h-[calc(100vh-3.5rem)]">
            <CommandCenter onSignOut={() => { window.location.hash = '/'; }} userFullName="Operator" />
          </div>
        )}
      </main>
    </div>
  );
}
