import { ThemeProvider } from "@/shared/theme-provider";
import { Router, RouterProvider, Route, RootRoute, Outlet } from '@tanstack/react-router';
import HomePage from '@/pages/HomePage';
import TournamentPage from '@/pages/TournamentPage';
import { Header } from "../shared/components/Header";
import { Footer } from "../shared/components/Footer";
import { useEffect } from 'react';
import { initializeAnalytics, analytics } from '@/shared/lib/analytics';

const rootRoute = new RootRoute({
  component: () => (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  ),
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const swissRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/swiss',
  component: TournamentPage,
});

const routeTree = rootRoute.addChildren([indexRoute, swissRoute]);

const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App: React.FC = () => {
  useEffect(() => {
    // Initialize PostHog once on app mount
    initializeAnalytics();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    const handleRouteChange = () => {
      analytics.pageView(window.location.pathname);
    };

    // Track initial page view
    handleRouteChange();

    // Subscribe to router changes
    const unsubscribe = router.subscribe('onLoad', handleRouteChange);

    return () => {
      unsubscribe();
    };
  }, []);

  return <RouterProvider router={router} />;
};

export default App;