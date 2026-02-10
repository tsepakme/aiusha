import { Link } from '@tanstack/react-router';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tournament Management Systems</h1>

        <p className="mb-8">
          Choose from different tournament systems to organize your competitions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/swiss" className="block p-6 border rounded-lg hover:bg-muted transition-colors">
            <h2 className="text-xl font-semibold mb-2">Swiss System</h2>
            <p className="text-muted-foreground">
              Ideal for Chess and other games where each player meets a comparable opponent in each round.
            </p>
          </Link>

          <div className="p-6 border rounded-lg opacity-60">
            <h2 className="text-xl font-semibold mb-2">Bergvall System</h2>
            <p className="text-muted-foreground">
              A modified single elimination tournament with additional matches for eliminated players.
            </p>
            <span className="text-sm mt-2 inline-block">(Coming soon)</span>
          </div>

          <Link to="/olympic" className="block p-6 border rounded-lg hover:bg-muted transition-colors">
            <h2 className="text-xl font-semibold mb-2">Olympic System</h2>
            <p className="text-muted-foreground">
              Single elimination brackets with clear progression paths. Winner advances, loser is out.
            </p>
          </Link>

          <div className="p-6 border rounded-lg opacity-60">
            <h2 className="text-xl font-semibold mb-2">Round-robin Tournament</h2>
            <p className="text-muted-foreground">
              Every participant plays against every other participant once.
            </p>
            <span className="text-sm mt-2 inline-block">(Coming soon)</span>
          </div>
        </div>
      </div>
    </div>
  );
}