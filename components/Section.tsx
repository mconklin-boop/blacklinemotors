import type { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-[#f7f7f6] text-blackline-black px-4 py-16 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="mx-auto max-w-[1240px]">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && (
              <p className="mb-3 text-sm font-black uppercase tracking-widest text-gray-500">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-blackline-black sm:text-4xl">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
