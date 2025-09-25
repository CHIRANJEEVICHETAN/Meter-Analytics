'use client';

import Image from 'next/image';

interface LoginwareLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function LoginwareLogo({ size = 'md' }: LoginwareLogoProps) {
  const sizeClasses = {
    sm: 'w-32 h-10',
    md: 'w-48 h-12',
    lg: 'w-64 h-16'
  };

  return (
    <div className="flex items-center">
      <Image
        src="/loginware.jpg"
        alt="Loginware.ai"
        width={size === 'sm' ? 128 : size === 'md' ? 192 : 256}
        height={size === 'sm' ? 40 : size === 'md' ? 48 : 64}
        className={`${sizeClasses[size]} object-contain`}
        priority
      />
    </div>
  );
}
