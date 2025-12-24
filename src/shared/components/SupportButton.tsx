import React from 'react';
import { Button } from '@/shared/components/button';
import { toast } from 'sonner';
import { analytics } from '@/shared/lib/analytics';
import { Heart } from 'lucide-react';

interface SupportButtonProps {
  source: string; // 'standings' | 'header' | 'footer'
  tournamentId?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

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

    // Show fake door message
    toast.success('Thank you for your interest! 🙏', {
      description: 'Payment support is coming soon. Your interest has been recorded.',
      duration: 5000,
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className="gap-2"
    >
      <Heart className="h-4 w-4" />
      Support this Project
    </Button>
  );
};
