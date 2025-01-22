import React from 'react';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Swiss Tournament System</h1>
      <p>
        <Link href="/swiss">
          <a>Go to Swiss Tournament Page</a>
        </Link>
      </p>
    </div>
  );
};

export default HomePage;