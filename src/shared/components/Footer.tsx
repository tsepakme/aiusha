import { Separator } from '@/shared/components/separator';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-4 md:px-6">
      <Separator className="mb-6" />
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Tournament Manager</h3>
            <p className="text-sm text-muted-foreground">
              A powerful tournament management system for chess, Go, checkers,
              and other games requiring player pairings and standings.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:underline">Documentation <span className='text-muted-foreground'>(Coming soon)</span></a>
              </li>
              <li>
                <a href="https://chess.stackexchange.com/questions/24915/how-is-buchholz-score-calculated-in-a-swiss-tournament"
                  className="text-sm hover:underline"
                  target="_blank"
                  rel="noopener noreferrer">
                  How Buchholz Score Works
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:underline">FAQ <span className='text-muted-foreground'>(Coming soon)</span></a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Contact</h3>
            <address className="space-y-2 sm:space-y-0 not-italic text-sm text-muted-foreground">
              <p className='flex items-center gap-1 hover:underline' aria-label='write a mail'>
                <ArrowUpRight size={20} aria-hidden='true' />
                <a href="mailto:aiusha@aiusha.com" target="_blank" rel="noopener noreferrer">mail</a>
              </p>
              <p className='flex items-center gap-1 hover:underline' aria-label='visit my GitHub page'>
                <ArrowUpRight size={20} aria-hidden='true' />
                <a href="https://www.github.com/tsepakme/aiusha" className="hover:underline" target="_blank" rel="noopener noreferrer">github</a>
              </p>
              <p className='flex items-center gap-1 hover:underline' aria-label='visit my LinkedIn page'>
                <ArrowUpRight size={20} aria-hidden='true' />
                <a href="https://www.linkedin.com/in/aiusha-mikhailov/" className="hover:underline" target="_blank" rel="noopener noreferrer">linkedin</a>
              </p>
              <p className='flex items-center gap-1 hover:underline' aria-label='write me via telegram'>
                <ArrowUpRight size={20} aria-hidden='true' />
                <a href="https://www.t.me/tsepakme" className="hover:underline" target="_blank" rel="noopener noreferrer">telegram</a>
              </p>
              <p className='flex items-center gap-1 hover:underline' aria-label='visit my portfolio and blog'>
                <ArrowUpRight size={20} aria-hidden='true' />
                <a href="https://www.tsepakme.com" className="hover:underline" target="_blank" rel="noopener noreferrer">portfolio & blog</a>
              </p>
            </address>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} Tournament Manager. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}