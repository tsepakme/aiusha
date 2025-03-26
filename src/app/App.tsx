import { ThemeProvider } from "@/shared/theme-provider";
import { Router, RouterProvider, Route, RootRoute, Outlet } from '@tanstack/react-router';
import HomePage from '@/pages/HomePage';
import TournamentPage from '@/pages/TournamentPage';
import { Header } from "../shared/components/Header";
import { Footer } from "../shared/components/Footer";

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
  return <RouterProvider router={router} />;
};

export default App;