import { memo, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CircleHelp,
  Clock3,
  FileText,
  Globe2,
  Layers3,
  Lightbulb,
  ListChecks,
  Mail,
  Search,
  Phone,
  Sparkles,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useScans } from '../context/ScansContext';
import { formatDate, getScoreTone } from '../utils/formatters';

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
    text: 'Paste a URL or text and get a crisp, rules-based score in seconds.'
  },
  {
    icon: Sparkles,
    title: 'Actionable Insights',
    text: 'The breakdown highlights exactly what helps AI understand your content.'
  },
  {
    icon: Layers3,
    title: 'Track Progress',
    text: 'See recent scans from the backend and compare changes over time.'
  }
];

const howItWorks = [
  {
    icon: Globe2,
    title: 'Scan any page',
    text: 'Check a live URL or paste content directly into the analyzer.'
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

const tips = [
  {
    index: '01',
    title: 'Add clear H1-H3 headings',
    text: 'Break up long pages with visible section hierarchy and short descriptive headings.'
  },
  {
    index: '02',
    title: 'Name your brand explicitly',
    text: 'Repeat your brand, product, or category name in the intro and supporting sections.'
  },
  {
    index: '03',
    title: 'Write concise FAQ sections',
    text: 'Short question-and-answer blocks help AI extract direct answers quickly.'
  },
  {
    index: '04',
    title: 'Show publication dates',
    text: 'Recency signals help content feel current to both users and AI systems.'
  },
  {
    index: '05',
    title: 'Add trust signals',
    text: 'Use proof points, authorship, testimonials, and cited sources.'
  },
  {
    index: '06',
    title: 'Use specific language',
    text: 'Replace vague wording with precise terms, examples, and concrete outcomes.'
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
    answer: 'Yes. You can scan without creating an account, and your history is stored on the backend with a browser cache fallback.'
  },
  {
    question: 'How accurate is the score?',
    answer: 'The score is rules-based and consistent, which makes it useful for comparison and content iteration.'
  },
  {
    question: 'What file types can I upload?',
    answer: 'You can upload PDF, JPG, and PNG files. PDFs are text-extracted before analysis.'
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
  const { getHistoryPage, refreshToken } = useScans();
  const [openFaq, setOpenFaq] = useState(0);
  const [recentScans, setRecentScans] = useState([]);
  const [recentScansLoading, setRecentScansLoading] = useState(true);

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [location.hash]);

  useEffect(() => {
    let active = true;
    setRecentScansLoading(true);
    getHistoryPage(1, 3)
      .then((result) => {
        if (!active) return;
        setRecentScans(result.scans || []);
      })
      .catch(() => {
        if (!active) return;
        setRecentScans([]);
      })
      .finally(() => {
        if (active) setRecentScansLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getHistoryPage, refreshToken]);

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
              <h1 className="text-4xl font-bold tracking-tight text-text md:text-6xl">
                See how AI sees your brand
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-text-muted md:text-lg">
                Technova Hub scores the signals that matter most for AI visibility. Use it to check structure,
                clarity, topical breadth, authority, and freshness before you publish.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(139,92,246,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(139,92,246,0.32)]"
                >
                  Check Your Score
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/history"
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-surfaceStrong px-5 py-3 text-sm font-semibold text-text transition duration-300 hover:-translate-y-0.5 hover:border-accent-purple/25 hover:shadow-[0_18px_36px_rgba(34,24,56,0.08)]"
                >
                  View History
                </Link>
              </div>
            </div>

            <motion.div whileHover={{ y: -4 }} className="glass-panel rounded-[1.6rem] p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Quick scan</p>
                  <h3 className="mt-1 text-lg font-semibold text-text">Try a URL, text, or file</h3>
                </div>
                <div className="rounded-full bg-accent-purple/10 px-3 py-1 text-xs font-semibold text-accent-purple">
                  5 dimensions
                </div>
              </div>

              <div className="inline-flex w-full rounded-full border border-border bg-surfaceStrong p-1">
                {['Check URL', 'Paste text', 'Upload file'].map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => navigate('/scan')}
                    className={[
                      'flex-1 rounded-full px-4 py-2 text-sm font-medium transition',
                      index === 0
                        ? 'bg-bg-elevated text-text shadow-[0_10px_25px_rgba(24,18,44,0.08)]'
                        : 'text-text-muted'
                    ].join(' ')}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-[1.4rem] border border-border bg-bg-elevated p-4">
                <div className="rounded-2xl border border-border bg-surfaceStrong px-4 py-3 text-sm text-text-muted">
                  https://yourbrand.com
                </div>
                <p className="mt-4 text-xs text-text-muted">Enter a URL starting with https://</p>
                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(139,92,246,0.24)]"
                >
                  Analyze now
                </button>
              </div>
            </motion.div>
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
            <table className="w-full border-collapse text-left text-sm">
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
      </section>

      <section
        id="tips"
        className="grid scroll-mt-20 gap-8 rounded-[2rem] border border-border bg-surface p-6 md:scroll-mt-24 md:p-8 lg:grid-cols-[1fr_0.9fr]"
      >
        <div>
          <SectionHeading
            eyebrow="Optimisation tips"
            title="Quick wins to boost your score"
            text="Small structural changes can create a large jump in readability and machine understanding."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {tips.map((tip) => (
              <motion.article key={tip.index} whileHover={{ y: -4 }} className="glass-panel rounded-[1.4rem] p-5">
                <p className="text-3xl font-bold text-accent-purple">{tip.index}</p>
                <h3 className="mt-3 text-lg font-semibold text-text">{tip.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">{tip.text}</p>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="glass-panel rounded-[1.6rem] p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-purple to-accent-cyan text-white">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Feature spotlight</p>
                <h3 className="mt-1 text-2xl font-bold text-text">Why the score changes</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-text-muted">
              The engine rewards clear headings, direct language, useful comparisons, and trust signals. It penalizes
              pages that are vague, under-structured, or sparse on context.
            </p>
          </div>

          <div className="glass-panel rounded-[1.6rem] p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-purple/10 text-accent-purple">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Output</p>
                <h3 className="mt-1 text-2xl font-bold text-text">Built for action</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-text-muted">
              Every result includes a score, a breakdown, and practical suggestions so you can fix the weakest
              dimension first.
            </p>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="grid scroll-mt-20 gap-8 rounded-[2rem] border border-border bg-surface p-6 md:scroll-mt-24 md:p-8 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
            text="Clear answers to the questions teams usually ask before they start using Technova Hub."
        />

        <div className="grid gap-3">
          {faqItems.map((item, index) => {
            const open = index === openFaq;
            return (
              <button
                key={item.question}
                type="button"
                onClick={() => setOpenFaq(index)}
                className="glass-panel group rounded-[1.2rem] px-4 py-4 text-left transition duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-text">{item.question}</span>
                  <CircleHelp className={`h-4 w-4 transition ${open ? 'text-accent-purple' : 'text-text-muted'}`} />
                </div>
                <p className={`mt-3 text-sm leading-6 text-text-muted ${open ? 'block' : 'hidden'}`}>{item.answer}</p>
              </button>
            );
          })}

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
              onClick={() => navigate('/scan')}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-bg-elevated px-5 py-3 text-sm font-semibold text-[#5b2bd9] transition hover:-translate-y-0.5"
            >
              Check your score now - it&apos;s free
            </button>
          </motion.div>
        </div>
      </section>

      <section
        id="history"
        className="grid scroll-mt-20 gap-8 rounded-[2rem] border border-border bg-surface p-6 md:scroll-mt-24 md:p-8 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <div>
          <SectionHeading
            eyebrow="Your history"
            title="Past scans"
            text="Your scan results are saved on the backend and mirrored locally for fast fallback access."
          />
        </div>

        <div className="glass-panel rounded-[1.6rem] p-5">
          {recentScansLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-[1.2rem] border border-border bg-bg-elevated" />
              ))}
            </div>
          ) : recentScans.length ? (
            <div className="grid gap-3">
              {recentScans.map((scan) => {
                const tone = getScoreTone(scan.score);
                const badgeClass =
                  tone === 'green'
                    ? 'bg-emerald-500/10 text-emerald-700'
                    : tone === 'yellow'
                      ? 'bg-amber-500/10 text-amber-700'
                      : 'bg-red-500/10 text-red-700';

                return (
                  <Link
                    key={scan.id}
                    to={`/results/${scan.id}`}
                    className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-border bg-bg-elevated px-4 py-4 transition duration-300 hover:-translate-y-0.5 hover:border-accent-purple/25 hover:shadow-[0_16px_34px_rgba(24,18,44,0.08)]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-muted">
                        <Clock3 className="h-4 w-4" />
                        {scan.type}
                      </div>
                      <p className="mt-2 truncate text-sm font-medium text-text">{scan.value}</p>
                      <p className="mt-1 text-xs text-text-muted">{formatDate(scan.createdAt)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${badgeClass}`}>{scan.score}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid place-items-center gap-3 rounded-[1.4rem] border border-dashed border-border bg-bg-elevated px-6 py-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-accent-purple/10 text-accent-purple">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-text">No scans yet</p>
              <p className="text-sm text-text-muted">Your scan history will appear here.</p>
              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-5 py-3 text-sm font-semibold text-white"
              >
                Run your first scan
              </button>
            </div>
          )}
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

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Technova Hub" className="h-10 w-10 rounded-2xl border border-border object-cover" />
          <div>
            <p className="font-semibold text-text">Technova Hub</p>
            <p className="text-sm text-text-muted">AI visibility score checker. Fast, instant, no account required.</p>
          </div>
        </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
            <Link to="/#how-it-works" className="transition hover:text-text">
              How it works
            </Link>
            <Link to="/#tips" className="transition hover:text-text">
              Tips
            </Link>
            <Link to="/#faq" className="transition hover:text-text">
              FAQ
            </Link>
            <Link to="/history" className="transition hover:text-text">
              History
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
