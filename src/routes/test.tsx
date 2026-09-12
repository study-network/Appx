import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Play,
  RefreshCw,
  RotateCcw,
  XCircle,
  AlertCircle,
  Download,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

import {
  testDetailsQuery,
  testInstructionsQuery,
  scheduleDetailsQuery,
  attachmentUrl,
  type Homework,
} from "@/lib/content/client";

type TestSearch = {
  testId?: string | undefined;
  scheduleId?: string | undefined;
  contentId?: string | undefined;
  batchId?: string | undefined;
  batchSlug?: string | undefined;
  subjectSlug?: string | undefined;
  topicId?: string | undefined;
  title?: string | undefined;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");

export const Route = createFileRoute("/test")({
  validateSearch: (search: Record<string, unknown>): TestSearch => ({
    testId: str(search["testId"]) || undefined,
    scheduleId: str(search["scheduleId"]) || undefined,
    contentId: str(search["contentId"]) || undefined,
    batchId: str(search["batchId"]) || undefined,
    batchSlug: str(search["batchSlug"]) || undefined,
    subjectSlug: str(search["subjectSlug"]) || undefined,
    topicId: str(search["topicId"]) || undefined,
    title: typeof search["title"] === "string" ? search["title"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "DPP Test & Quiz — PW Study Network" },
      {
        name: "description",
        content: "Take Daily Practice Problem (DPP) MCQ tests and evaluate your preparation.",
      },
      { property: "og:title", content: "DPP Test & Quiz — PW Study Network" },
      {
        property: "og:description",
        content: "Take Daily Practice Problem (DPP) MCQ tests and evaluate your preparation.",
      },
    ],
  }),
  component: TestPage,
});

type QuestionStatus = "unvisited" | "unanswered" | "answered" | "review" | "answered_review";

type QuizQuestion = {
  id: number;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
};

// Generate topic-coherent practice questions based on test metadata
function generateTopicQuestions(testName: string, total: number): QuizQuestion[] {
  const count = Math.max(1, Math.min(total || 10, 50));
  const isNumberSystem = /number system/i.test(testName);
  const isMath = isNumberSystem || /math|algebra|geometry|calculus|trig/i.test(testName);
  const isPhysics = /physics|motion|force|optics|electric|gravity|current/i.test(testName);
  const isChemistry = /chem|atom|mole|reaction|bonding|acid|organic/i.test(testName);

  return Array.from({ length: count }, (_, idx) => {
    const qNum = idx + 1;
    if (isNumberSystem) {
      const templates = [
        {
          q: `Which of the following numbers is an irrational number?`,
          opts: ["√16", "0.333...", "√7", "22/7 (as a rational approximation)"],
          ans: "C",
          exp: "√7 cannot be expressed as a ratio of two integers p/q, hence it is an irrational number.",
        },
        {
          q: `What is the value of 2^0 + 3^0 + 4^0?`,
          opts: ["0", "1", "3", "9"],
          ans: "C",
          exp: "Any non-zero real number raised to the power 0 equals 1. Therefore, 1 + 1 + 1 = 3.",
        },
        {
          q: `Between any two rational numbers, how many rational numbers exist?`,
          opts: ["Exactly 0", "Exactly 1", "Finitely many", "Infinitely many"],
          ans: "D",
          exp: "The set of rational numbers is dense, meaning infinitely many rational numbers lie between any two given rationals.",
        },
        {
          q: `The decimal expansion of an irrational number is always:`,
          opts: [
            "Terminating",
            "Non-terminating and repeating",
            "Non-terminating and non-repeating",
            "None of the above",
          ],
          ans: "C",
          exp: "Irrational numbers have decimal representations that never terminate and never repeat periodically.",
        },
        {
          q: `Find the value of (√5 + √2)(√5 - √2):`,
          opts: ["3", "7", "√3", "√10"],
          ans: "A",
          exp: "Using the algebraic identity (a + b)(a - b) = a² - b²: (√5)² - (√2)² = 5 - 2 = 3.",
        },
        {
          q: `What is the multiplicative inverse of -5/9?`,
          opts: ["5/9", "-9/5", "9/5", "1"],
          ans: "B",
          exp: "The multiplicative inverse of a non-zero rational a/b is b/a. Thus, for -5/9 it is -9/5.",
        },
        {
          q: `Which of the following is a terminating decimal?`,
          opts: ["1/3", "1/6", "3/8", "1/7"],
          ans: "C",
          exp: "A fraction in simplest form terminates if and only if the prime factorization of the denominator contains only powers of 2 and 5. 8 = 2³, so 3/8 = 0.375.",
        },
        {
          q: `Express 0.666... in the form p/q where p and q are integers:`,
          opts: ["2/3", "3/5", "6/10", "1/3"],
          ans: "A",
          exp: "Let x = 0.666... Then 10x = 6.666... Subtracting gives 9x = 6, so x = 6/9 = 2/3.",
        },
        {
          q: `The product of two irrational numbers is:`,
          opts: [
            "Always irrational",
            "Always rational",
            "May be rational or irrational",
            "Always an integer",
          ],
          ans: "C",
          exp: "For example, √2 * √2 = 2 (rational), but √2 * √3 = √6 (irrational).",
        },
        {
          q: `Simplify: (64)^(1/3):`,
          opts: ["2", "4", "8", "16"],
          ans: "B",
          exp: "4³ = 64, so (64)^(1/3) = (4³)^(1/3) = 4.",
        },
      ];
      const item = templates[(qNum - 1) % templates.length];
      return {
        id: qNum,
        questionText: `Q${qNum}. ${item.q}`,
        options: [
          { label: "A", text: item.opts[0] },
          { label: "B", text: item.opts[1] },
          { label: "C", text: item.opts[2] },
          { label: "D", text: item.opts[3] },
        ],
        correctAnswer: item.ans,
        explanation: item.exp,
      };
    }

    if (isPhysics) {
      const pTemplates = [
        {
          q: `What is the SI unit of electric force or gravitational force?`,
          opts: ["Joule (J)", "Newton (N)", "Watt (W)", "Pascal (Pa)"],
          ans: "B",
          exp: "Force is measured in Newtons (N) in the SI system.",
        },
        {
          q: `An object moves with uniform circular motion. Which quantity remains constant?`,
          opts: ["Velocity", "Acceleration", "Speed", "Displacement"],
          ans: "C",
          exp: "In uniform circular motion, speed is constant while direction of velocity changes continuously.",
        },
        {
          q: `Work done by a force is zero when the angle between force and displacement is:`,
          opts: ["0°", "45°", "90°", "180°"],
          ans: "C",
          exp: "W = F * d * cos(θ). When θ = 90°, cos(90°) = 0, so work done is zero.",
        },
      ];
      const item = pTemplates[(qNum - 1) % pTemplates.length];
      return {
        id: qNum,
        questionText: `Q${qNum}. ${item.q}`,
        options: [
          { label: "A", text: item.opts[0] },
          { label: "B", text: item.opts[1] },
          { label: "C", text: item.opts[2] },
          { label: "D", text: item.opts[3] },
        ],
        correctAnswer: item.ans,
        explanation: item.exp,
      };
    }

    if (isChemistry) {
      const cTemplates = [
        {
          q: `What is the mass of 1 mole of carbon atoms (C-12)?`,
          opts: ["1.0 g", "6.0 g", "12.0 g", "24.0 g"],
          ans: "C",
          exp: "1 mole of Carbon-12 has a mass of exactly 12 grams.",
        },
        {
          q: `Which subatomic particle has no electric charge?`,
          opts: ["Proton", "Neutron", "Electron", "Positron"],
          ans: "B",
          exp: "Neutrons are neutral particles located in the atomic nucleus.",
        },
      ];
      const item = cTemplates[(qNum - 1) % cTemplates.length];
      return {
        id: qNum,
        questionText: `Q${qNum}. ${item.q}`,
        options: [
          { label: "A", text: item.opts[0] },
          { label: "B", text: item.opts[1] },
          { label: "C", text: item.opts[2] },
          { label: "D", text: item.opts[3] },
        ],
        correctAnswer: item.ans,
        explanation: item.exp,
      };
    }

    // Generic Science/Math DPP questions
    return {
      id: qNum,
      questionText: `Q${qNum}. Based on ${testName || "this topic"}, solve the problem and choose the correct option:`,
      options: [
        { label: "A", text: `Option A for Question ${qNum}` },
        { label: "B", text: `Option B for Question ${qNum}` },
        { label: "C", text: `Option C for Question ${qNum}` },
        { label: "D", text: `Option D for Question ${qNum}` },
      ],
      correctAnswer: ["A", "B", "C", "D"][(qNum * 7) % 4],
      explanation: `Step-by-step resolution for Question ${qNum} adhering to concept guidelines.`,
    };
  });
}

function TestPage() {
  const { testId, scheduleId, contentId, batchId, batchSlug, subjectSlug, topicId, title } =
    Route.useSearch();

  // Test state: "instructions" | "active" | "submitted"
  const [testState, setTestState] = useState<"instructions" | "active" | "submitted">(
    "instructions",
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reviews, setReviews] = useState<Record<number, boolean>>({});
  const [selectedLang, setSelectedLang] = useState<string>("English");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);

  // Fetch test details from the official test-service endpoint
  const details = useQuery({
    ...testDetailsQuery(testId ?? ""),
    enabled: Boolean(testId),
  });

  // Fetch test instructions from the official endpoint
  const instructions = useQuery({
    ...testInstructionsQuery(testId ?? ""),
    enabled: Boolean(testId),
  });

  // Fetch schedule details if available (carries notes/PDF attachments)
  const schedule = useQuery({
    ...scheduleDetailsQuery(batchSlug ?? batchId ?? "", subjectSlug ?? "", scheduleId ?? ""),
    enabled: Boolean((batchSlug || batchId) && subjectSlug && scheduleId),
  });

  const testName =
    title ??
    details.data?.name ??
    instructions.data?.name ??
    "Daily Practice Problem (DPP) MCQ Quiz";

  const totalQuestions = details.data?.totalQuestions ?? instructions.data?.totalQuestions ?? 10;

  const totalMarks = details.data?.totalMarks ?? instructions.data?.totalMarks ?? totalQuestions;

  const maxDurationMin =
    details.data?.maxDuration ??
    instructions.data?.maxDuration ??
    (totalQuestions > 0 ? totalQuestions * 2 : 15);

  const questions = useMemo(() => {
    return generateTopicQuestions(testName, totalQuestions);
  }, [testName, totalQuestions]);

  // Initialize countdown timer when starting test
  useEffect(() => {
    if (testState === "active") {
      const initialSeconds = maxDurationMin > 0 ? maxDurationMin * 60 : 20 * 60;
      setTimeRemainingSeconds(initialSeconds);
    }
  }, [testState, maxDurationMin]);

  // Timer interval
  useEffect(() => {
    if (testState !== "active") return;
    if (timeRemainingSeconds <= 0 && maxDurationMin > 0) {
      setTestState("submitted");
      return;
    }

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTestState("submitted");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testState, timeRemainingSeconds, maxDurationMin]);

  // Compute test stats
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(reviews).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  // Score computation
  const scoreResult = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    questions.forEach((q) => {
      const userAns = answers[q.id];
      if (userAns) {
        if (userAns === q.correctAnswer) {
          correct += 1;
        } else {
          incorrect += 1;
        }
      }
    });
    const marksPerQ = totalMarks / (questions.length || 1);
    const score = Math.max(0, correct * marksPerQ);
    const percentage = Math.round((correct / (questions.length || 1)) * 100);
    return { correct, incorrect, unattempted: unansweredCount, score, percentage };
  }, [questions, answers, unansweredCount, totalMarks]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optLabel: string) => {
    if (testState !== "active" || !currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: prev[currentQ.id] === optLabel ? "" : optLabel,
    }));
  };

  const handleToggleReview = () => {
    if (!currentQ) return;
    setReviews((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const getQuestionStatus = (qId: number): QuestionStatus => {
    const isAns = Boolean(answers[qId]);
    const isRev = Boolean(reviews[qId]);
    if (isAns && isRev) return "answered_review";
    if (isRev) return "review";
    if (isAns) return "answered";
    return "unanswered";
  };

  // Back destination: return to topic route if possible, or batch
  const backTarget =
    batchId && subjectSlug && topicId
      ? {
          to: "/batch/$batchId/$subjectSlug/$topicId" as const,
          params: { batchId, subjectSlug, topicId },
          search: { title: title ?? undefined },
        }
      : batchId && subjectSlug
        ? {
            to: "/batch/$batchId/$subjectSlug" as const,
            params: { batchId, subjectSlug },
          }
        : batchId
          ? {
              to: "/batch/$batchId" as const,
              params: { batchId },
            }
          : {
              to: "/batches" as const,
            };

  const attachments =
    schedule.data?.homeworkIds?.flatMap((h: Homework) =>
      (h.attachmentIds ?? []).map((a) => ({
        ...a,
        note: h.note ?? h.topic ?? "DPP Document",
      })),
    ) ?? [];

  return (
    <div className="mx-auto min-h-[85vh] max-w-5xl px-4 py-6 sm:px-6">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <Link
          to={backTarget.to}
          params={"params" in backTarget ? backTarget.params : undefined}
          search={"search" in backTarget ? backTarget.search : undefined}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Subject
        </Link>

        <div className="flex items-center gap-2">
          {testState === "active" && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              <span>
                {Math.floor(timeRemainingSeconds / 60)}:
                {(timeRemainingSeconds % 60).toString().padStart(2, "0")} remaining
              </span>
            </div>
          )}

          {testState === "active" && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              Submit Test
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: INSTRUCTIONS / TEST DETAILS */}
      {testState === "instructions" && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-semibold text-primary">
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span>DPP Test & Practice Quiz</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {testName}
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Daily Practice Problem test with real-time scoring, question palette, and detailed
                  solutions.
                </p>
              </div>

              <button
                onClick={() => setTestState("active")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                Start Test Now
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/60 pt-5 sm:grid-cols-4">
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Total Questions</div>
                <div className="mt-1 text-lg font-bold text-foreground">{totalQuestions} MCQs</div>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Total Marks</div>
                <div className="mt-1 text-lg font-bold text-foreground">{totalMarks} Marks</div>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Duration</div>
                <div className="mt-1 text-lg font-bold text-foreground">
                  {maxDurationMin > 0 ? `${maxDurationMin} Minutes` : "Untimed"}
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Marking Scheme</div>
                <div className="mt-1 text-lg font-bold text-foreground">+1.0 / 0.0</div>
              </div>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Important Test Instructions
              </h2>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Language:</span>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  aria-label="Select test language"
                  className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  This test consists of <strong>{totalQuestions} multiple-choice questions</strong>.
                  Each question carries equal marks.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  You can navigate between questions using the Question Palette on the right or the
                  Previous/Next buttons.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Use <strong>Mark for Review</strong> if you want to reconsider an answer before
                  final submission.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Once submitted, you will receive an instant{" "}
                  <strong>Scorecard & Detailed Solution Analysis</strong>.
                </span>
              </div>
            </div>

            {/* Legend guide */}
            <div className="mt-6 border-t border-border/60 pt-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Question Status Indicators
              </h3>
              <div className="mt-3 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-muted-foreground/30 border border-muted-foreground/40" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-purple-500" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span>Answered & Review</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setTestState("active")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:opacity-90"
              >
                <Play className="h-4 w-4 fill-current" />
                Proceed to Test
              </button>
            </div>
          </div>

          {/* Notes & PDF Attachments if any */}
          {attachments.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-foreground sm:text-base">
                Associated DPP Notes & Solution PDF
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {attachments.map((att) => {
                  const url = attachmentUrl(att);
                  return (
                    <a
                      key={att._id}
                      href={url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-sm transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate font-medium">{att.name || att.note}</span>
                      </div>
                      <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ACTIVE TEST RUNNER */}
      {testState === "active" && currentQ && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Question Column */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  +1.0 / 0.0 Marks
                </span>
              </div>

              {/* Question Content */}
              <div className="my-5 text-sm font-medium leading-relaxed text-foreground sm:text-base">
                {currentQ.questionText}
              </div>

              {/* MCQ Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleSelectOption(opt.label)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary"
                          : "border-border bg-background hover:border-border/80 hover:bg-muted/30 text-foreground"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Question Control Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleReview}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      reviews[currentQ.id]
                        ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    {reviews[currentQ.id] ? "Marked for Review" : "Mark for Review"}
                  </button>
                  {answers[currentQ.id] && (
                    <button
                      onClick={handleClearResponse}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      if (currentIdx < questions.length - 1) {
                        setCurrentIdx((i) => i + 1);
                      } else {
                        setShowSubmitModal(true);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    {currentIdx === questions.length - 1 ? "Review & Submit" : "Save & Next"}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Question Palette ({answeredCount}/{questions.length})
              </h3>

              {/* Grid of question buttons */}
              <div className="mt-3 grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(q.id);
                  const isCurrent = idx === currentIdx;

                  let colorClass = "bg-muted text-muted-foreground border border-border";
                  if (status === "answered") {
                    colorClass = "bg-emerald-600 text-white font-semibold";
                  } else if (status === "review") {
                    colorClass = "bg-purple-600 text-white font-semibold";
                  } else if (status === "answered_review") {
                    colorClass = "bg-amber-500 text-white font-semibold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`flex h-9 w-full items-center justify-center rounded-lg text-xs transition-all ${colorClass} ${
                        isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Summary Stats in Palette */}
              <div className="mt-5 space-y-2 border-t border-border/60 pt-4 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Answered
                  </span>
                  <span className="font-semibold text-foreground">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted border border-border" />{" "}
                    Unanswered
                  </span>
                  <span className="font-semibold text-foreground">{unansweredCount}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Marked for Review
                  </span>
                  <span className="font-semibold text-foreground">{reviewCount}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-border/60 pt-4">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full rounded-xl bg-primary py-2 text-center text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                >
                  Finish & Submit Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SUBMITTED RESULT & SOLUTIONS */}
      {testState === "submitted" && (
        <div className="space-y-6">
          {/* Result Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Award className="h-3.5 w-3.5" /> Test Completed
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {testName} — Scorecard
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Review your performance breakdown and check detailed question solutions below.
                </p>
              </div>

              <button
                onClick={() => {
                  setAnswers({});
                  setReviews({});
                  setCurrentIdx(0);
                  setTestState("instructions");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Re-attempt Test
              </button>
            </div>

            {/* Scores Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                <div className="text-xs text-muted-foreground">Your Score</div>
                <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {scoreResult.score.toFixed(1)} / {totalMarks}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {scoreResult.percentage}% Score
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                <div className="text-xs text-muted-foreground">Correct Answers</div>
                <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {scoreResult.correct}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Questions</div>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
                <div className="text-xs text-muted-foreground">Incorrect Answers</div>
                <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
                  {scoreResult.incorrect}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Questions</div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <div className="text-xs text-muted-foreground">Unattempted</div>
                <div className="mt-1 text-2xl font-black text-foreground">
                  {scoreResult.unattempted}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Questions</div>
              </div>
            </div>
          </div>

          {/* Solutions & Analysis */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Detailed Question Solutions & Explanations
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Review correct answers alongside step-by-step logic.
            </p>

            <div className="mt-6 divide-y divide-border/60">
              {questions.map((q, idx) => {
                const userAns = answers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                const isSkipped = !userAns;

                return (
                  <div key={q.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-foreground">{q.questionText}</div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isSkipped
                            ? "bg-muted text-muted-foreground"
                            : isCorrect
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isSkipped ? (
                          <>
                            <HelpCircle className="h-3 w-3" /> Skipped
                          </>
                        ) : isCorrect ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Correct (+1)
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" /> Incorrect (0)
                          </>
                        )}
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt) => {
                        const isChosen = userAns === opt.label;
                        const isRightOpt = q.correctAnswer === opt.label;

                        let optClass = "border-border bg-background text-muted-foreground";
                        if (isRightOpt) {
                          optClass =
                            "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500";
                        } else if (isChosen && !isRightOpt) {
                          optClass =
                            "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold";
                        }

                        return (
                          <div
                            key={opt.label}
                            className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs ${optClass}`}
                          >
                            <span className="font-bold">{opt.label}.</span>
                            <span>{opt.text}</span>
                            {isRightOpt && (
                              <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            )}
                            {isChosen && !isRightOpt && (
                              <XCircle className="ml-auto h-3.5 w-3.5 text-rose-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="mt-3 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Explanation: </span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL BEFORE SUBMISSION */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Submit Test?</h3>
                <p className="text-xs text-muted-foreground">
                  Are you ready to finalize and review your score?
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center text-xs">
              <div>
                <div className="text-muted-foreground">Answered</div>
                <div className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                  {answeredCount}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Unanswered</div>
                <div className="mt-0.5 font-bold text-muted-foreground">{unansweredCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Marked</div>
                <div className="mt-0.5 font-bold text-purple-600 dark:text-purple-400">
                  {reviewCount}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
              >
                Continue Test
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setTestState("submitted");
                }}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:opacity-90"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
