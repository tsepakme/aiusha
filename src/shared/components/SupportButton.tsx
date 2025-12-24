import React from 'react';
import { Button } from '@/shared/components/button';
import { analytics } from '@/shared/lib/analytics';
import { Heart } from 'lucide-react';

interface SupportButtonProps {
  source: string; // 'standings' | 'header' | 'footer'
  tournamentId?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/aiusha';

export const SupportButton: React.FC<SupportButtonProps> = ({
  source,
  tournamentId,
  variant = 'default',
  size = 'default',
}) => {
  const handleClick = () => {
    // Track monetization signal
    analytics.supportClicked({
      source,
      tournament_id: tournamentId,
    });

    // Open Buy Me a Coffee in new tab
    window.open(BUY_ME_A_COFFEE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className="gap-2"
    >
      <Heart className="h-4 w-4" />
      Buy Me a Coffee
    </Button>
  );
};

