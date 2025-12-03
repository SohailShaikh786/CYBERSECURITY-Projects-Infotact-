import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import routes from '@/routes';

export default function Header() {
  const location = useLocation();

  const visibleRoutes = routes.filter((route) => route.visible !== false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Shield className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">ThreatIntel</span>
        </Link>

        <nav className="hidden xl:flex items-center gap-6 ml-8">
          {visibleRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === route.path
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {visibleRoutes.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location.pathname === route.path
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {route.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
