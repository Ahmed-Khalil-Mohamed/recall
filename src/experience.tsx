import { useState, type ReactNode } from "react";
import {
  Plus,
  Scales,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  FolderOpen,
  FileText,
  Wrench,
  ShieldCheck,
  Package,
  Receipt,
  Cards,
  MapPin,
  Clock,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import {
  type Project,
  type Entry,
  type Lang,
  type Action,
  cash,
} from "./contracts";
import { Status, fmtDate } from "./components";
type Slots = {
  p: Project;
  now: Date;
  create: () => void;
  notices: ReactNode;
  metrics: ReactNode;
  features: ReactNode;
  records: ReactNode;
  lang: Lang;
};
type Props = {
  p: Project;
  rows: Entry[];
  lang: Lang;
  now: Date;
  busy: boolean;
  open: (e: Entry) => void;
  action: (e: Entry, a: Action) => void;
};
const words = (lang: Lang) => (en: string, ar: string) =>
  lang === "ar" ? ar : en;
function Title({ e, p, open }: Pick<Props, "p" | "open"> & { e: Entry }) {
  return (
    <button className="record-title" dir="auto" onClick={() => open(e)}>
      {p.title(e.data)}
      <ArrowUpRight size={17} />
    </button>
  );
}
function Next({ e, p, lang, busy, action }: Props & { e: Entry }) {
  const a = p.actions.find((a) => a.when(e.data));
  return a ? (
    <button
      className="secondary compact"
      disabled={busy}
      onClick={() => action(e, a)}
    >
      {a.label[lang]}
      <ArrowRight size={14} />
    </button>
  ) : null;
}
function Scene({ label }: { label: string }) {
  return (
    <figure className="brand-scene">
      <img src="/brand-scene.png" alt="" />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function ProductComposition({
  p,
  now,
  create,
  notices,
  metrics,
  features,
  records,
  lang,
}: Slots) {
  const t = words(lang);
  return (
    <div className="experience">
      <div className="recall-heading" id="overview">
        <span className="overline">
          {t("A LITTLE, EVERY DAY", "خطوة صغيرة كل يوم")}
        </span>
        <h1>{t("Stay curious.", "خلّي فضولك صاحي.")}</h1>
        <button className="secondary" onClick={create}>
          <Plus />
          {p.createLabel[lang]}
        </button>
      </div>
      <div className="recall-stage">
        <div className="study-orbit" aria-hidden="true">
          <Cards size={26} />
        </div>
        {features}
      </div>
      <div className="recall-progress">{metrics}</div>
      <div className="recall-library">{records}</div>
      <div className="workspace-notes">{notices}</div>
    </div>
  );
}
export function ProductRecords(props: Props) {
  const { p, rows, lang, now, busy, open, action } = props;
  const t = words(lang);
  const [topic, setTopic] = useState("");
  const topics = Array.from(new Set(rows.map((e) => e.data.topic as string)));
  const visible = topic ? rows.filter((e) => e.data.topic === topic) : rows;
  return (
    <div className="knowledge-library">
      <div className="topic-switches">
        <button aria-pressed={!topic} onClick={() => setTopic("")}>
          {t("All topics", "كل الموضوعات")}
          <span>{rows.length}</span>
        </button>
        {topics.map((x) => (
          <button
            key={x}
            aria-pressed={topic === x}
            onClick={() => setTopic(topic === x ? "" : x)}
          >
            {x}
            <span>{rows.filter((e) => e.data.topic === x).length}</span>
          </button>
        ))}
      </div>
      <div className="knowledge-cards">
        {visible.map((e, i) => (
          <article className="record-card knowledge-card" key={e.id}>
            <div>
              <span className="card-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Status project={p} entry={e} lang={lang} now={now} />
            </div>
            <Title {...props} e={e} />
            <footer>
              <span>{e.data.topic}</span>
              <span>
                {e.data.reviews.length} {t("reviews", "مراجعات")}
              </span>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
