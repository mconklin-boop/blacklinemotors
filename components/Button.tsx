import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type BaseProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type LinkProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const styles = {
  primary: "bg-white text-blackline-black hover:bg-blackline-silver",
  secondary: "border border-blackline-steel bg-blackline-graphite text-white hover:border-white",
  ghost: "text-white hover:bg-white/10"
};

export function Button(props: ButtonProps | LinkProps) {
  const className = clsx(
    "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
    styles[props.variant ?? "primary"],
    props.className
  );

  if (typeof props.href === "string") {
    const { href, children, variant: _variant, className: _className, ...rest } = props;
    void _variant;
    void _className;
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  const { children, variant: _variant, className: _className, ...rest } = props;
  void _variant;
  void _className;
  return (
    <button className={className} {...rest}>
      {children}
    </button>
  );
}
