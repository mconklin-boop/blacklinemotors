import Image from "next/image";

export function BrandLogo() {
  return (
    <Image
      src="/brand/blackline-motors-red-outline.webp"
      alt="Blackline Motors"
      width={1002}
      height={348}
      sizes="(max-width: 600px) 170px, 240px"
      className="brand-logo"
      priority
    />
  );
}
