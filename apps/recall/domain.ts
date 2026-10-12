import { z } from "zod";
import { c, text, metric, fail, type Project } from "../../src/contracts";
export function schedule(d: any, grade: string, now: Date) {
  let interval = d.interval,
    ease = d.ease,
    repetitions = d.repetitions;
  if (grade === "again") {
    interval = 0;
    repetitions = 0;
    ease = Math.max(1.3, ease - 0.2);
  } else if (grade === "hard") {
    interval = Math.max(1, Math.round(interval * 1.2));
    ease = Math.max(1.3, ease - 0.15);
    repetitions++;
  } else if (grade === "good") {
    interval =
      repetitions === 0
        ? 1
        : repetitions === 1
          ? 6
          : Math.round(interval * ease);
    repetitions++;
  } else if (grade === "easy") {
    interval =
      repetitions === 0 ? 4 : Math.round(Math.max(1, interval) * ease * 1.3);
    ease = Math.min(3.5, ease + 0.15);
    repetitions++;
  } else fail("invalid_grade");
  interval = Math.min(interval, 36500);
  return {
    ...d,
    interval,
    ease,
    repetitions,
    dueAt: new Date(
      +now + (grade === "again" ? 600000 : interval * 86400000),
    ).toISOString(),
    reviews: [...d.reviews, { grade, at: now.toISOString(), interval }],
  };
}
export const recall: Project = {
  id: "recall",
  name: "Recall",
  arabic: "افتكر",
  kind: "desktop",
  color: "#365c88",
  mark: "10",
  tagline: c(
    "A little today. Remember tomorrow.",
    "مراجعة صغيرة النهارده، معرفة باقية بكرة.",
  ),
  problem: c(
    "An offline study deck with due-card reviews, answer reveal, and an explained spaced-repetition scheduler.",
    "بطاقات مذاكرة دون إنترنت، مع مراجعات مستحقة وكشف الإجابة وجدولة تكرار متباعد موضحة.",
  ),
  entity: c("cards", "بطاقات"),
  createLabel: c("Create a card", "إنشاء بطاقة"),
  fields: [
    {
      key: "question",
      label: c("Question / prompt", "السؤال"),
      type: "textarea",
      required: true,
    },
    {
      key: "answer",
      label: c("Answer", "الإجابة"),
      type: "textarea",
      required: true,
    },
    {
      key: "topic",
      label: c("Topic / deck", "الموضوع / المجموعة"),
      required: true,
    },
  ],
  schema: z
    .object({
      question: text,
      answer: z.string().trim().min(1).max(3000),
      topic: text,
    })
    .strict(),
  create: (d, n) => ({
    ...d,
    interval: 0,
    ease: 2.5,
    repetitions: 0,
    dueAt: n.toISOString(),
    reviews: [],
  }),
  act: (d, a, p, n) => {
    if (a !== "review") fail("invalid_transition");
    if (Date.parse(d.dueAt) > +n) fail("not_due");
    return schedule(
      d,
      z
        .object({ grade: z.enum(["again", "hard", "good", "easy"]) })
        .strict()
        .parse(p).grade,
      n,
    );
  },
  actions: [],
  title: (d) => d.question,
  subtitle: (d) => d.topic,
  status: (d, n) =>
    Date.parse(d.dueAt) <= +n
      ? "due"
      : d.interval >= 21
        ? "established"
        : "learning",
  statuses: {
    due: c("Due now", "مستحقة الآن"),
    learning: c("Learning", "قيد التعلم"),
    established: c("Established", "متقدمة"),
  },
  metrics: (r, n) => [
    metric(
      "Ready to review",
      "جاهزة للمراجعة",
      r.filter((x) => Date.parse(x.data.dueAt) <= +n).length,
      "Review the answer before grading",
      "راجع الإجابة قبل التقييم",
    ),
    metric(
      "Study cards",
      "بطاقات المذاكرة",
      r.length,
      "Your personal knowledge library",
      "مكتبة معرفتك الشخصية",
    ),
    metric(
      "Reviews completed",
      "مراجعات مكتملة",
      r.reduce((s, x) => s + x.data.reviews.length, 0),
      "Recorded learning sessions",
      "جلسات تعلم مسجلة",
    ),
  ],
  seed: (n) => [
    {
      question: "What makes a database transaction atomic?",
      answer:
        "All operations in a transaction succeed together, or the whole transaction is rolled back. Partial changes are not committed.",
      topic: "Backend fundamentals",
      interval: 0,
      ease: 2.5,
      repetitions: 0,
      dueAt: n.toISOString(),
      reviews: [],
    },
    {
      question: "Why store currency as integer minor units?",
      answer:
        "Integer cents avoid binary floating-point rounding errors when splitting and summing monetary amounts.",
      topic: "Software design",
      interval: 0,
      ease: 2.5,
      repetitions: 0,
      dueAt: n.toISOString(),
      reviews: [],
    },
  ],
};
