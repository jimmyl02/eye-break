export const TypographyH3 = ({
  children,
}: {
  children: React.JSX.Element | string;
}) => {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
      {children}
    </h3>
  );
};

export const TypographyH4 = ({
  children,
}: {
  children: React.JSX.Element | string;
}) => {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h4>
  );
};

export const TypographyMuted = ({
  children,
}: {
  children: React.JSX.Element | string;
}) => {
  return <p className="text-sm text-muted-foreground">{children}</p>;
};

export const TypographyP = ({
  children,
}: {
  children: React.JSX.Element | string;
}) => {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
};
