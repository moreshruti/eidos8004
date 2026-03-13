'use client';

import type { LucideIcon } from 'lucide-react';

interface MorphingIconProps {
  icon: LucideIcon;
  className?: string;
}

function MorphingIcon({ icon: Icon, className }: MorphingIconProps) {
  return <Icon className={`${className} icon-morph`} strokeWidth={1.5} />;
}

export { MorphingIcon };
