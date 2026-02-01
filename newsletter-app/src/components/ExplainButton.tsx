'use client';

import { useContext } from 'react';
import { HelpCircle } from 'lucide-react';
import { DevContext, ExplainableItem } from './DevContext';
import { Button } from '@/components/ui/button';

interface ExplainButtonProps {
  item: Exclude<ExplainableItem, null>;
  className?: string;
  size?: 'sm' | 'default';
}

export function ExplainButton({ item, className = '', size = 'sm' }: ExplainButtonProps) {
  // Use raw context to avoid throwing when outside provider
  const context = useContext(DevContext);
  
  // Don't render if no context or dev panel is closed
  if (!context || !context.isDevPanelOpen) return null;

  const { setExplainedItem, setShowCodeDrawer, explainedItem } = context;

  const isActive = explainedItem === item;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isActive) {
      setExplainedItem(null);
      setShowCodeDrawer(false);
    } else {
      setExplainedItem(item);
      setShowCodeDrawer(true);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'sm' : 'default'}
      onClick={handleClick}
      className={`
        ${size === 'sm' ? 'h-6 w-6 p-0' : 'h-8 px-2'}
        ${isActive 
          ? 'bg-humanity-lime/20 text-humanity-lime border border-humanity-lime/50' 
          : 'text-muted-foreground hover:text-humanity-lime hover:bg-humanity-lime/10'
        }
        transition-all duration-200
        ${className}
      `}
      title="Explain this data"
    >
      <HelpCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {size !== 'sm' && <span className="ml-1 text-xs">Explain</span>}
    </Button>
  );
}

