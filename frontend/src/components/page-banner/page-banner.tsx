import Image from "next/image";
import Link from "next/link";

type PageBannerProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  image?: { src: string; width: number; height: number };
};

const DEFAULT_IMAGE = {
  src: "/images/feed/hero.png",
  width: 647,
  height: 403,
};

export function PageBanner({
  title,
  subtitle,
  backHref,
  image = DEFAULT_IMAGE,
}: PageBannerProps) {
  return (
    <section className="page-banner">
      <div className="feed-container page-banner-inner">
        <div className="page-banner-text">
          {backHref && (
            <Link href={backHref} className="page-banner-back">
              ← Volver
            </Link>
          )}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <Image
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
          className="page-banner-image"
        />
      </div>
    </section>
  );
}