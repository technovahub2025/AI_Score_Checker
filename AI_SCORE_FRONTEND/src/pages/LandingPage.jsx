import { memo, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  ChevronDown,
  ChevronUp,
  Globe2,
  Layers3,
  ListChecks,
  Mail,
  Search,
  Phone,
  Sparkles,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import QuickScanCard from '../components/QuickScanCard';
import BrandLogo from '../components/BrandLogo';

const metrics = [
  { value: '50K+', label: 'Brands scanned' },
  { value: '94%', label: 'Accuracy rate' },
  { value: '<2s', label: 'Avg. scan time' },
  { value: '5', label: 'Score dimensions' }
];

const features = [
  {
    icon: Search,
    title: 'Fast Analysis',
    text: 'Paste a URL and get a crisp, rules-based score in seconds.'
  },
  {
    icon: Sparkles,
    title: 'Actionable Insights',
    text: 'The breakdown highlights exactly what helps AI understand your content.'
  },
  {
    icon: Layers3,
    title: 'Stay focused',
    text: 'A simple interface keeps the scan workflow fast and easy to repeat.'
  }
];

const howItWorks = [
  {
    icon: Globe2,
    title: 'Scan any page',
    text: 'Check a live URL directly in the analyzer.'
  },
  {
    icon: ListChecks,
    title: 'Score five dimensions',
    text: 'Structure, clarity, keywords, authority, and freshness are scored independently.'
  },
  {
    icon: Brain,
    title: 'Read the guidance',
    text: 'Clear recommendations tell you what to improve first.'
  }
];

const faqItems = [
  {
    question: 'What is an AI visibility score?',
    answer:
      'It is a structured estimate of how well your content communicates brand, topic, and trust signals to AI systems.'
  },
  {
    question: 'Is Technova Hub completely free?',
    answer: 'Yes. You can scan without creating an account.'
  },
  {
    question: 'How accurate is the score?',
    answer: 'The score is rules-based and consistent, which makes it useful for comparison and content iteration.'
  },
  {
    question: 'What do I need to scan a page?',
    answer: 'Just paste a live https URL. The scan checks the page directly and does not require any account setup.'
  },
  {
    question: 'Can I improve my score quickly?',
    answer: 'Yes. Clear headings, tighter topic focus, and stronger supporting context usually move the score fastest.'
  },
  {
    question: 'Does Technova Hub store my scan results?',
    answer: 'Results are generated instantly so you can review them right away. The app does not require saved history to use the scanner.'
  }
];

const comparisonRows = [
  ['Heading structure', 'Important', 'Critical'],
  ['Keyword density', 'Important', 'Less so'],
  ['Answer-format content', 'Moderate', 'Critical'],
  ['Author credentials', 'Moderate', 'Critical'],
  ['Backlink count', 'Critical', 'Not direct'],
  ['Content freshness', 'Moderate', 'Important'],
  ['Entity clarity', 'Moderate', 'Critical']
];

const MetricCard = memo(({ value, label }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="glass-panel rounded-[1.5rem] p-6 text-center transition duration-300"
  >
    <p className="text-3xl font-bold text-accent-purple md:text-[2.2rem]">{value}</p>
    <p className="mt-2 text-sm font-medium text-text-muted">{label}</p>
  </motion.div>
));

const FeatureCard = memo(({ icon: Icon, title, text }) => (
  <motion.article
    whileHover={{ y: -4 }}
    className="glass-panel rounded-[1.5rem] p-5 transition duration-300"
  >
    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-accent-purple/15 to-accent-cyan/15 text-accent-purple">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-text">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-text-muted">{text}</p>
  </motion.article>
));

const SectionHeading = ({ eyebrow, title, text }) => (
  <div className="max-w-2xl">
    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-accent-purple">{eyebrow}</p>
    <h2 className="mt-3 text-3xl font-bold tracking-tight text-text md:text-[2.3rem]">{title}</h2>
    <p className="mt-3 text-sm leading-7 text-text-muted md:text-base">{text}</p>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openFaq, setOpenFaq] = useState(0);

  const scrollToQuickScan = () => {
    const target = document.getElementById('quick-scan');
    if (!target) {
      navigate('/#quick-scan');
      return;
    }

    const header = document.querySelector('header');
    const headerOffset = header ? header.getBoundingClientRect().height : 88;
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const offsetTop = Math.max(targetTop - headerOffset - 24, 0);

    window.scrollTo({ top: offsetTop, behavior: 'smooth' });

    const input = target.querySelector('input');
    if (input instanceof HTMLElement) {
      input.focus({ preventScroll: true });
    }
  };

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (!hash) return;
    if (hash === 'quick-scan') {
      requestAnimationFrame(scrollToQuickScan);
      return;
    }

    const el = document.getElementById(hash);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [location.hash]);

  return (
    <div className="w-full space-y-12 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-surface px-6 py-8 shadow-[0_24px_80px_rgba(24,18,44,0.08)] md:px-8 md:py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="orb absolute left-0 top-0 h-72 w-72 rounded-full bg-accent-purple/15 blur-3xl" />
          <div className="orb absolute right-0 top-8 h-80 w-80 rounded-full bg-accent-cyan/12 blur-3xl [animation-delay:1.5s]" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center rounded-full border border-border bg-surfaceStrong px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
              AI Visibility Score Checker
            </span>
            <p className="text-sm text-text-muted">No account required | Free to use | Instant results</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl md:text-6xl">
                See how AI sees your brand
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted md:text-lg md:leading-8">
                Technova Hub scores the signals that matter most for AI visibility. Use it to check structure,
                clarity, topical breadth, authority, and freshness before you publish.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={scrollToQuickScan}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(139,92,246,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(139,92,246,0.32)] sm:px-5"
                >
                  Check Your Score
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <QuickScanCard />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </section>

      <section
        id="how-it-works"
        className="grid scroll-mt-20 gap-8 rounded-[2rem] border border-border bg-surface p-6 md:scroll-mt-24 md:p-8 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="grid gap-4">
          {howItWorks.map((item) => (
            <motion.article
              key={item.title}
              whileHover={{ y: -4 }}
              className="glass-panel rounded-[1.4rem] p-5"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-purple/10 text-accent-purple">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">{item.text}</p>
            </motion.article>
          ))}
        </div>

        <div className="grid gap-4">
          <SectionHeading
            eyebrow="How it works"
            title="Five dimensions, one clear score"
            text="Technova Hub compares your content against the signals large language models rely on when deciding whether your brand is easy to understand and worth surfacing."
          />

          <div className="overflow-hidden rounded-[1.6rem] border border-border bg-bg-elevated">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-surfaceStrong text-[0.72rem] uppercase tracking-[0.22em] text-text-muted">
                    <th className="px-5 py-4 font-semibold">Factor</th>
                    <th className="px-5 py-4 font-semibold">Traditional SEO</th>
                    <th className="px-5 py-4 font-semibold">AI visibility</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr key={row[0]} className={index % 2 === 0 ? 'bg-transparent' : 'bg-surfaceStrong/60'}>
                      <td className="px-5 py-4 font-medium text-text">{row[0]}</td>
                      <td className="px-5 py-4 text-text-muted">{row[1]}</td>
                      <td className="px-5 py-4 text-text-muted">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="grid scroll-mt-20 gap-8 rounded-[2rem] border border-border bg-surface p-6 md:scroll-mt-24 md:p-8 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="flex h-full flex-col gap-6 lg:pt-2">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            text="Clear answers to the questions teams usually ask before they start using Technova Hub."
          />

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-[1.6rem] bg-[linear-gradient(135deg,#7c3aed_0%,#3b82f6_45%,#db2777_100%)] p-6 text-white shadow-[0_24px_50px_rgba(124,58,237,0.28)]"
          >
            <h3 className="text-2xl font-bold">Ready to see how AI sees your brand?</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/85">
              Start with a quick scan and get a visual report that shows where your content needs the most help.
            </p>
            <button
              type="button"
              onClick={scrollToQuickScan}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-bg-elevated px-5 py-3 text-sm font-semibold text-[#5b2bd9] transition hover:-translate-y-0.5"
            >
              Check your score now - it&apos;s free
            </button>
          </motion.div>
        </div>

        <div className="grid gap-3">
          {faqItems.map((item, index) => {
            const open = index === openFaq;
            return (
              <button
                key={item.question}
                type="button"
                onClick={() => setOpenFaq((current) => (current === index ? -1 : index))}
                aria-expanded={open}
                className="glass-panel group rounded-[1.2rem] px-4 py-4 text-left transition duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="pt-0.5 font-medium text-text">{item.question}</span>
                  {open ? (
                    <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-accent-purple transition" />
                  ) : (
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-text-muted transition" />
                  )}
                </div>
                <p className={`mt-3 text-sm leading-6 text-text-muted ${open ? 'block' : 'hidden'}`}>{item.answer}</p>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="flex flex-col gap-6 border-t border-border pt-6">
        <div className="flex flex-col gap-4 rounded-[1.6rem] border border-border bg-surface px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 text-sm text-text-muted md:flex-row md:flex-wrap md:items-center md:gap-x-8 md:gap-y-4">
            <a
              href="tel:+919003530230"
              className="inline-flex items-center gap-3 transition hover:text-text"
            >
              <Phone className="h-4 w-4 shrink-0 text-accent-purple" />
              <span className="font-medium text-text">+91 90035 30230</span>
            </a>
            <a
              href="mailto:technovahubcareer@gmail.com"
              className="inline-flex items-center gap-3 transition hover:text-text"
            >
              <Mail className="h-4 w-4 shrink-0 text-accent-purple" />
              <span className="font-medium text-text">technovahubcareer@gmail.com</span>
            </a>
            <a
              href="https://www.technovahub.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 transition hover:text-text md:ml-0"
            >
              <Globe className="h-4 w-4 shrink-0 text-accent-cyan" />
              <span className="font-medium text-text">www.technovahub.in</span>
            </a>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
          <Link to="/" className="justify-self-start">
            <BrandLogo variant="footer" />
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted md:justify-self-end">
            <Link to="/#how-it-works" className="transition hover:text-text">
              How it works
            </Link>
            <Link to="/#faq" className="transition hover:text-text">
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

