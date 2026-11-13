import { useState } from "react";
import prepApi from "../api/prepApi";
import Navbar from "../components/Navbar";

const BEHAVIORAL_QUESTIONS = [
    "Tell me about a time you faced a conflict while working on a team project.",
    "Describe a situation where you had to learn something completely new under a deadline.",
    "Tell me about a time you made a mistake. How did you handle it?",
    "Describe a project you're proud of and the challenges you overcame.",
    "Tell me about a time you had to convince someone to see things your way.",
    "Describe a situation where you had to prioritize multiple tasks with limited time.",
    "Tell me about a time you received critical feedback. How did you respond?",
    "Describe a time you took initiative without being asked.",
];

const CRITERIA = [
    { key: "relevance", label: "Answers the question" },
    { key: "depth", label: "Technical depth" },
    { key: "clarity", label: "Clarity" },
    { key: "specificity", label: "Specific details" },
];

const RING_LENGTH = 2 * Math.PI * 42;

// Same thresholds as before: 7+ good, 4-6 fair, below 4 weak.
function scoreTone(score) {
    if (score >= 7) return { name: "mint", text: "text-mint", bg: "bg-mint" };
    if (score >= 4) return { name: "amber", text: "text-amber", bg: "bg-amber" };
    return { name: "coral", text: "text-coral", bg: "bg-coral" };
}

function scoreWord(score) {
    if (score >= 8) return "Strong";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs work";
}

const OUTPUT_BOX = "text-sm text-lo bg-ink border border-line rounded-xl p-4 mt-4 whitespace-pre-wrap font-sans leading-relaxed";

function Prep() {
    const [ingesting, setIngesting] = useState(false);
    const [ingestStatus, setIngestStatus] = useState(null);

    const [questions, setQuestions] = useState([]);
    const [genLoading, setGenLoading] = useState(false);
    const [genError, setGenError] = useState("");

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [answer, setAnswer] = useState("");
    const [evalLoading, setEvalLoading] = useState(false);
    const [evalResult, setEvalResult] = useState(null);
    const [evalError, setEvalError] = useState("");

    const [selectedQuestion, setSelectedQuestion] = useState(BEHAVIORAL_QUESTIONS[0]);
    const [behAnswer, setBehAnswer] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const handleResumeIngest = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIngesting(true);
        setIngestStatus(null);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await prepApi.post("/ingest-resume", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setIngestStatus(`Indexed - ${res.data.chunks_stored} chunks stored.`);
        } catch (err) {
            setIngestStatus("Failed to index resume. Try again.");
        }
        setIngesting(false);
    };

    const handleGenerateQuestions = async () => {
        setGenLoading(true);
        setGenError("");
        setQuestions([]);
        setSelectedIndex(null);
        setAnswer("");
        setEvalResult(null);
        setEvalError("");
        try {
            const res = await prepApi.post("/generate-questions");
            if (res.data.error) {
                setGenError(res.data.error);
            } else {
                setQuestions(res.data.questions);
            }
        } catch (err) {
            setGenError("Something went wrong generating questions. Is prep-service running on port 8082?");
        }
        setGenLoading(false);
    };

    const handleSelectQuestion = (index) => {
        setSelectedIndex(index);
        setAnswer("");
        setEvalResult(null);
        setEvalError("");
    };

    const handleEvaluate = async () => {
        if (!answer.trim() || selectedIndex === null) return;
        setEvalLoading(true);
        setEvalResult(null);
        setEvalError("");
        try {
            const res = await prepApi.post("/evaluate-answer", {
                question: questions[selectedIndex],
                answer,
            });
            if (res.data.fallback) {
                setEvalError(res.data.message);
            } else {
                setEvalResult(res.data);
            }
        } catch (err) {
            setEvalError("Something went wrong scoring your answer. Is prep-service running on port 8082?");
        }
        setEvalLoading(false);
    };

    const handleGetFeedback = async () => {
        if (!behAnswer.trim()) return;
        setFeedbackLoading(true);
        setFeedback(null);
        try {
            const res = await prepApi.post(
                `/behavioral-feedback?question=${encodeURIComponent(selectedQuestion)}&answer=${encodeURIComponent(behAnswer)}`
            );
            setFeedback(res.data.feedback);
        } catch (err) {
            setFeedback("Something went wrong getting feedback.");
        }
        setFeedbackLoading(false);
    };

    const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
    const tone = evalResult ? scoreTone(evalResult.overall) : null;

    return (
        <div className="min-h-screen bg-ink app-bg">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                <h1 className="font-display font-bold text-3xl text-hi">Interview prep</h1>

                {/* Step 1: index the resume */}
                <section className="card border-l-4 border-l-violet p-7">
                    <h2 className="font-display font-bold text-xl text-hi">1. Index your resume</h2>
                    <p className="text-sm text-lo mt-1 mb-5">
                        Upload your resume so the questions below can be tailored to your actual experience.
                    </p>
                    <label className="btn btn-grad cursor-pointer focus-within:ring-2 focus-within:ring-violet">
                        {ingesting ? "Indexing..." : "Upload resume"}
                        <input type="file" accept=".pdf" onChange={handleResumeIngest} className="sr-only" />
                    </label>
                    {ingestStatus && <p role="status" className="text-sm text-mint mt-3">{ingestStatus}</p>}
                </section>

                {/* Step 2 and 3: pick a question, answer it, get a score */}
                <section className="card border-l-4 border-l-mint p-7">
                    <h2 className="font-display font-bold text-xl text-hi">2. Answer a question about your resume</h2>
                    <p className="text-sm text-lo mt-1 mb-5">
                        Generate 5 questions from your resume, pick one, write your answer and get a score out of 10.
                    </p>
                    <button onClick={handleGenerateQuestions} disabled={genLoading} className="btn btn-grad">
                        {genLoading ? "Generating..." : questions.length > 0 ? "Generate new questions" : "Generate questions"}
                    </button>

                    {genError && <p role="alert" className="text-sm text-coral mt-3">{genError}</p>}

                    {questions.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <p className="text-sm text-lo">Pick a question to answer it.</p>
                            {questions.map((q, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    aria-pressed={selectedIndex === index}
                                    onClick={() => handleSelectQuestion(index)}
                                    className={`w-full text-left rounded-xl border p-4 bg-ink transition-colors ${
                                        selectedIndex === index
                                            ? "border-mint ring-1 ring-mint"
                                            : "border-line hover:border-mint/60"
                                    }`}
                                >
                                    <span className="block text-xs font-semibold text-mint mb-1">Question {index + 1}</span>
                                    <span className="block text-sm text-hi leading-relaxed">{q}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedIndex !== null && (
                        <div className="mt-6">
                            <label htmlFor="resume-answer" className="block text-sm font-medium text-hi mb-2">
                                Your answer to question {selectedIndex + 1}
                            </label>
                            <textarea
                                id="resume-answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                rows={7}
                                placeholder="Write your answer the way you would say it in an interview. Aim for 50 words or more."
                                className="inp py-3 mb-3"
                            />
                            <div className="flex flex-wrap items-center gap-4">
                                <button onClick={handleEvaluate} disabled={evalLoading || !answer.trim()} className="btn btn-grad">
                                    {evalLoading ? "Scoring..." : "Evaluate answer"}
                                </button>
                                <span className="text-sm text-lo">{wordCount} words</span>
                            </div>

                            {evalError && <p role="alert" className="text-sm text-coral mt-3">{evalError}</p>}

                            {evalResult && (
                                <div className="mt-6 bg-ink border border-line rounded-2xl p-6">
                                    <div className="grid gap-6 sm:grid-cols-[auto_1fr] items-center mb-6">
                                        <div className="relative w-32 h-32 mx-auto">
                                            <svg width="128" height="128" viewBox="0 0 100 100" role="img" aria-label={`Overall score ${evalResult.overall} out of 10`}>
                                                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" style={{ stroke: "rgb(var(--line))" }} />
                                                <circle
                                                    cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
                                                    strokeDasharray={`${(evalResult.overall / 10) * RING_LENGTH} ${RING_LENGTH}`}
                                                    transform="rotate(-90 50 50)"
                                                    style={{ stroke: `rgb(var(--${tone.name}))` }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`font-display font-bold text-3xl ${tone.text}`}>{evalResult.overall}</span>
                                                <span className="text-xs text-lo">out of 10</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className={`font-display font-bold text-xl mb-3 ${tone.text}`}>{scoreWord(evalResult.overall)}</p>
                                            <ul className="space-y-3">
                                                {CRITERIA.map((c) => {
                                                    const s = evalResult.scores[c.key];
                                                    return (
                                                        <li key={c.key}>
                                                            <div className="flex justify-between text-xs text-lo mb-1">
                                                                <span>{c.label}</span>
                                                                <span className="font-mono">{s} / 10</span>
                                                            </div>
                                                            <div className="h-2 rounded-full bg-line overflow-hidden">
                                                                <div className={`h-full rounded-full ${scoreTone(s).bg}`} style={{ width: `${s * 10}%` }} />
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>

                                    {evalResult.length_capped && (
                                        <p className="text-sm text-amber mb-4">
                                            Your answer was short, so the highest possible score was limited. Add more detail and try again.
                                        </p>
                                    )}

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {evalResult.strengths && (
                                            <div className="rounded-xl border border-line bg-surface p-4">
                                                <p className="text-xs font-semibold text-mint mb-1">What went well</p>
                                                <p className="text-sm text-hi leading-relaxed">{evalResult.strengths}</p>
                                            </div>
                                        )}
                                        {evalResult.improvements && (
                                            <div className="rounded-xl border border-line bg-surface p-4">
                                                <p className="text-xs font-semibold text-amber mb-1">How to improve</p>
                                                <p className="text-sm text-hi leading-relaxed">{evalResult.improvements}</p>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-lo mt-4">
                                        Scored by a small AI model, so use it as a guide, not an exact grade.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Behavioral practice */}
                <section className="card border-l-4 border-l-amber p-7">
                    <h2 className="font-display font-bold text-xl text-hi">Behavioral practice</h2>
                    <p className="text-sm text-lo mt-1 mb-5">Pick a question, write your answer, get structured feedback.</p>

                    <label htmlFor="beh-question" className="sr-only">Question</label>
                    <select
                        id="beh-question"
                        value={selectedQuestion}
                        onChange={(e) => setSelectedQuestion(e.target.value)}
                        className="inp mb-3"
                    >
                        {BEHAVIORAL_QUESTIONS.map((q) => (
                            <option key={q} value={q}>{q}</option>
                        ))}
                    </select>

                    <label htmlFor="beh-answer" className="sr-only">Your answer</label>
                    <textarea
                        id="beh-answer"
                        value={behAnswer}
                        onChange={(e) => setBehAnswer(e.target.value)}
                        rows={5}
                        placeholder="Write your answer here..."
                        className="inp py-3 mb-4"
                    />

                    <button onClick={handleGetFeedback} disabled={feedbackLoading} className="btn btn-grad">
                        {feedbackLoading ? "Thinking..." : "Get feedback"}
                    </button>

                    {feedback && <pre className={OUTPUT_BOX}>{feedback}</pre>}
                </section>
            </main>
        </div>
    );
}

export default Prep;