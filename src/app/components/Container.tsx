// src/app/components/Container.tsx
import * as React from "react";

type Props<T extends React.ElementType = "div"> = {
  as?: T;
  /** Klasy dla wewnętrznego wrappera (max-width) */
  className?: string;
  /** Klasy dla zewnętrznego elementu (ten z paddingami) */
  outerClassName?: string;
  /** Gdy true — usuwa domyślny padding zewnętrzny (px-*) */
  noOuterPadding?: boolean;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function Container<T extends React.ElementType = "div">(
  { as, className = "", outerClassName = "", noOuterPadding = false, children, ...rest }: Props<T>
) {
  // Rzutujemy na `any`, żeby TS nie wymuszał `children: never`
  const Tag = (as ?? "div") as any;

  // Domyślne paddingi zewnętrzne; można je wyłączyć flagą noOuterPadding
  const outerPadding = noOuterPadding
    ? ""
    : "px-12 sm:px-14 lg:px-16 xl:px-20 2xl:px-24";

  return (
    <Tag
      className={`w-full ${outerPadding} ${outerClassName}`}
      {...(rest as object)}
    >
      <div className={`mx-auto w-full max-w-[1600px] ${className}`}>
        {children}
      </div>
    </Tag>
  );
}
