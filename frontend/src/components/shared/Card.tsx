export const Card = ({
  title,
  subtitle,
  children
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="panel panel-padding">
    {title ? (
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
    ) : null}
    {children}
  </section>
);
