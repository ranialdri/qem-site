import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface QemLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Emblème architectural QEM (Noir + Blanc + Or)
 * Respecte le contrat de barre supérieure : un seul élément textuel épuré dans le header.
 */
export const QemBrandMark: React.FC<QemLogoProps> = ({ variant = 'dark', size = 'md' }) => {
  const isLight = variant === 'light';

  const boxSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }[size];

  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap shrink-0">
      <span
        className={`${boxSizes} relative inline-flex items-center justify-center rounded-lg bg-[#0F0F10] border border-[#C59B27]/60 shadow-xs shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
        >
          {/* Roofline / Architectural House Silhouette in Gold */}
          <path
            d="M7 18.5L20 8L33 18.5"
            stroke="#C59B27"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle Sparkle Star at Apex */}
          <path
            d="M20 3.5L20.9 6.1L23.5 7L20.9 7.9L20 10.5L19.1 7.9L16.5 7L19.1 6.1L20 3.5Z"
            fill="#DFB84C"
          />
          {/* Monogram QEM inside */}
          <text
            x="20"
            y="29"
            textAnchor="middle"
            fill="#FAF9F6"
            fontFamily="Cormorant Garamond, Georgia, serif"
            fontWeight="700"
            fontSize="12.5"
            letterSpacing="0.08em"
          >
            QEM
          </text>
          {/* Gold base underline */}
          <line
            x1="11"
            y1="33"
            x2="29"
            y2="33"
            stroke="#C59B27"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={`${textSizes} font-bold tracking-tight ${
          isLight ? 'text-[#FAF9F6]' : 'text-[#0F0F10]'
        }`}
      >
        QEM <span className="text-[#C59B27] font-normal">–</span> Qassi Entretien Ménager
      </span>
    </span>
  );
};

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

/**
 * Composant d'image résilient (Zero-Broken-Image Policy)
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle = 'QEM – Qassi Entretien Ménager',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#18181B] via-[#0F0F10] to-[#27272A] text-[#FAF9F6] p-6 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackTitle}
      >
        <Sparkles className="w-8 h-8 text-[#C59B27] mb-3" />
        <p className="font-display text-lg font-semibold tracking-wide text-[#FAF9F6]">
          {fallbackTitle}
        </p>
        <p className="text-xs text-[#C59B27] mt-1">Des espaces propres, sains et agréables.</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || fallbackTitle}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
