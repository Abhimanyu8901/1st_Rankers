const channels = [
  {
    title: "Instagram",
    subtitle: "Daily updates and student highlights",
    image: "/social/instagram-qr.svg"
  },
  {
    title: "Telegram",
    subtitle: "Instant notices, batches, and study alerts",
    image: "/social/telegram-qr.svg"
  },
  {
    title: "YouTube",
    subtitle: "Lectures, shorts, and revision sessions",
    image: "/social/youtube-qr.svg"
  }
];

export const Footer = () => (
  <footer className="panel overflow-hidden">
    <div className="bg-gradient-to-r from-slate-950 via-brand-900 to-slate-900 px-6 py-8 text-white md:px-8">
      <p className="text-xs uppercase tracking-[0.35em] text-brand-100">1st Rankers</p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Stay connected beyond the classroom.</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Scan your preferred channel for announcements, learning content, and community updates.
          </p>
        </div>
        <p className="text-sm font-medium text-brand-100">Learn. Practice. Rank.</p>
      </div>
    </div>
    <div className="grid gap-5 p-6 md:grid-cols-3 md:p-8">
      {channels.map((channel) => (
        <div
          key={channel.title}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
        >
          <img
            src={channel.image}
            alt={`${channel.title} QR`}
            className="mx-auto h-auto w-full max-w-[220px] rounded-2xl bg-white object-contain"
          />
          <div className="mt-4 text-center">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{channel.title}</h4>
            <p className="mt-1 text-sm text-slate-500">{channel.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  </footer>
);
