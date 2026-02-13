import { Link } from '@tanstack/react-router';
import { ModeToggle } from '@/shared/components/mode-toggle';
import { Separator } from '@/shared/components/separator';

export function Header() {
  return (
    <header className="w-full py-4 px-4 md:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Tournament Manager</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6" aria-label='Main Navigation'>
          <Link to="/" className="text-sm font-medium hover:underline">Home</Link>
          <Link to="/swiss" className="text-sm font-medium hover:underline">Swiss System</Link>
          <Link to="/olympic" className="text-sm font-medium hover:underline">Olympic System</Link>
          <Link to="/swiss-de" className="text-sm font-medium hover:underline">Swiss Double Elimination</Link>
        </nav>
        <ModeToggle />
      </div>
      <Separator className="mt-4" />
    </header>
  );
}