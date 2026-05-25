const sizes = {
  header: {
    icon: 'h-10 w-10 sm:h-12 sm:w-12',
    title: 'text-[0.95rem] font-semibold',
    eyebrow: 'text-[0.68rem]',
    gap: 'gap-3'
  },
  footer: {
    icon: 'h-12 w-12 sm:h-14 sm:w-14',
    title: 'text-[0.95rem] font-semibold',
    eyebrow: '',
    gap: 'gap-3'
  }
};

const BrandLogo = ({ variant = 'header', className = '' }) => {
  const size = sizes[variant] || sizes.header;
  const isFooter = variant === 'footer';

  if (isFooter) {
    return (
      <div className={['flex items-center text-left', size.gap, className].filter(Boolean).join(' ')}>
        <div className="grid shrink-0 place-items-center overflow-hidden rounded-[1rem] border border-border bg-white p-1 shadow-[0_10px_24px_rgba(34,24,56,0.08)]">
          <img
            src="/logo_2.png"
            alt="Technova Hub"
            className={['block rounded-[0.75rem] object-contain', size.icon].join(' ')}
          />
        </div>
        <div className="flex min-w-0 flex-col items-start gap-1">
          <p className={['text-text', size.title].join(' ')}>Technova Hub</p>
          <p className="max-w-[15rem] text-xs leading-5 text-text-muted sm:max-w-none sm:text-sm">
            Empowering Minds. © 2025 Grand Helm. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={['flex items-center', size.gap, className].filter(Boolean).join(' ')}>
      <div className="grid shrink-0 place-items-center rounded-2xl border border-border bg-white p-1 shadow-[0_10px_24px_rgba(34,24,56,0.08)]">
        <img
          src="/logo.png"
          alt="Grand Helm"
          className={['block rounded-[0.85rem] object-cover object-top', size.icon].join(' ')}
        />
      </div>
      <div className="hidden sm:block">
        <p className={['uppercase tracking-[0.24em] text-text-muted', size.eyebrow].join(' ')}>AI Visibility</p>
        <p className={['text-text', size.title].join(' ')}>Grand Helm</p>
      </div>
    </div>
  );
};

export default BrandLogo;

