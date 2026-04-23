import clsx from "clsx";

export const Badge = ({ value }: { value: string }) => (
  <span
    className={clsx(
      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
      value === "paid" || value === "present"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        : value === "failed" || value === "absent"
          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    )}
  >
    {value}
  </span>
);
