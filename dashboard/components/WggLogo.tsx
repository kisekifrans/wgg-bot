type Props = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'icon' | 'full';
  className?: string;
};

const DISPLAY = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 120,
  hero: 140,
} as const;

export function WggLogo({ size = 'md', variant = 'icon', className = '' }: Props) {
  const display = DISPLAY[size];
  const src = variant === 'full' ? '/wgg-logo.png' : '/wgg-icon.png';
  const rounded = variant === 'icon' ? 'rounded-full' : 'rounded-none';

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="WGG Ticket"
      width={variant === 'full' ? display : display}
      height={variant === 'full' ? display : display}
      className={`${rounded} shrink-0 object-contain ${className}`}
      style={{
        width: display,
        height: variant === 'full' ? 'auto' : display,
        imageRendering: 'auto',
      }}
      decoding="async"
      draggable={false}
    />
  );
}
