import { Button } from "@/components/Button";

export function CTASection({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="border border-white/10 bg-blackline-graphite p-8 shadow-metal sm:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-black uppercase text-white">{title}</h2>
          <p className="mt-3 text-blackline-silver">{text}</p>
        </div>
        <Button href={href}>{cta}</Button>
      </div>
    </div>
  );
}
