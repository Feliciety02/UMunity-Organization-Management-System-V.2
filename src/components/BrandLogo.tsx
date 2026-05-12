import logoUrl from "@/assets/umunity-logomark.svg";

type BrandLogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  text?: string;
};

export function BrandLogo({
  size = 40,
  showText = true,
  className = "",
  imageClassName = "",
  textClassName = "",
  text = "UMunity",
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={logoUrl}
        alt="UMunity logomark"
        width={size}
        height={size}
        className={`shrink-0 object-contain ${imageClassName}`}
      />
      {showText && (
        <span className={`font-display font-bold tracking-tight ${textClassName}`}>
          {text}
        </span>
      )}
    </span>
  );
}

export { logoUrl as brandLogoUrl };
