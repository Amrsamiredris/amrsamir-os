type Brand = { slug: string; name: string; logo: string | null; wordmark?: boolean };

/**
 * One-colour logo strip. Logos are flattened to a single ink with CSS filters, so any
 * uploaded SVG or transparent PNG matches. Brands without a logo are set in type.
 * Scrolls slowly; static and wrapped when reduced motion is on.
 */
export function BrandStrip({ brands, label = "Brands I've worked with" }: { brands: Brand[]; label?: string }) {
  if (!brands.length) return null;
  const Item = ({ b, hidden }: { b: Brand; hidden?: boolean }) => (
    <li className="brand-item" aria-hidden={hidden || undefined}>
      {b.logo && b.wordmark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.logo} alt={hidden ? "" : b.name} className="brand-logo brand-logo-word" loading="lazy" decoding="async" />
      ) : (
        <>
          {b.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.logo} alt="" className="brand-logo" loading="lazy" decoding="async" />
          ) : null}
          <span className="brand-word">{b.name}</span>
        </>
      )}
    </li>
  );
  return (
    <section className="brand-strip" aria-label={label}>
      <ul className="brand-track">
        {brands.map((b) => (
          <Item key={b.slug} b={b} />
        ))}
        {brands.map((b) => (
          <Item key={`${b.slug}-dup`} b={b} hidden />
        ))}
      </ul>
    </section>
  );
}
