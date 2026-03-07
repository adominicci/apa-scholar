const getBridgeStatus = (): string =>
  window.apaScholar?.meta.platform === 'desktop'
    ? 'Secure desktop bridge ready'
    : 'Desktop bridge unavailable';

export const App = () => (
  <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 md:px-6">
      <div className="grid flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-panel)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
            Project foundation shell
          </p>
          <h1 className="mt-4 font-[var(--font-display)] text-4xl leading-none">
            APA Scholar
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
            Course workspace foundation
          </p>

          <div className="mt-8 space-y-3">
            <div className="rounded-2xl bg-[var(--color-card)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Bridge status
              </p>
              <p className="mt-2 text-sm font-medium">{getBridgeStatus()}</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-card)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Renderer policy
              </p>
              <p className="mt-2 text-sm font-medium">
                Typed preload only, no direct Electron access
              </p>
            </div>
          </div>
        </aside>

        <main className="overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[var(--color-card)] shadow-[var(--shadow-panel)]">
          <div className="border-b border-[var(--color-line)] bg-[linear-gradient(135deg,var(--color-card),var(--color-panel))] px-8 py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Local-first desktop workspace
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl leading-tight">
              Secure shell, typed boundaries, and the first academic workspace
              canvas.
            </h2>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: 'Main process',
                detail:
                  'Browser lifecycle, secure window defaults, and future native services.',
              },
              {
                title: 'Preload bridge',
                detail:
                  'Minimal typed namespace ready for future IPC contracts.',
              },
              {
                title: 'Renderer workspace',
                detail:
                  'Foundation shell prepared for courses, papers, and ghost-page workflows.',
              },
            ].map((card) => (
              <section
                key={card.title}
                className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-panel)] p-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {card.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-ink)]">
                  {card.detail}
                </p>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  </div>
);
