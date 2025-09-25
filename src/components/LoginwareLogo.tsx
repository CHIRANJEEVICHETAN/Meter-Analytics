'use client';

interface LoginwareLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function LoginwareLogo({ size = 'md', showText = true }: LoginwareLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-16 h-16 text-2xl'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold">L</span>
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-semibold text-gray-900`}>
            Loginware.ai
          </h1>
        </div>
      )}
    </div>
  );
}
