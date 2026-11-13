import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import interviewApi from "../api/interviewApi";
import prepApi from "../api/prepApi";
import Navbar from "../components/Navbar";
import { useTheme } from "../theme";

const DIFFICULTY_TEXT = { EASY: "text-mint", MEDIUM: "text-amber", HARD: "text-coral" };
const MONACO_LANG = { python: "python", java: "java", cpp: "cpp" };
const MAX_HINT_LEVEL = 4;

function buildStarter(problem, language) {
    if (language === "python") {
        return problem.functionSignature
            ? `${problem.functionSignature}\n    # write your code here\n    pass\n`
            : "# not available for this problem in Python";
    }
    if (language === "java") {
        return problem.starterCodeJava || "// not available for this problem in Java";
    }
    if (language === "cpp") {
        return problem.starterCodeCpp || "// not available for this problem in C++";
    }
    return "";
}

function ProblemDetail() {
    const { id } = useParams();
    const theme = useTheme();
    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState("");
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [items, setItems] = useState([]);
    const [tutorBusy, setTutorBusy] = useState("");
    const [tutorError, setTutorError] = useState("");

    const [suggestInput, setSuggestInput] = useState("");
    const [suggestOutput, setSuggestOutput] = useState("");
    const [suggestBusy, setSuggestBusy] = useState(false);
    const [suggestMessage, setSuggestMessage] = useState("");
    const [suggestError, setSuggestError] = useState("");

    useEffect(() => {
        setItems([]);
        setResult(null);
        setTutorError("");
        setSuggestMessage("");
        setSuggestError("");
        interviewApi.get(`/problems/${id}`).then((res) => {
            setProblem(res.data);
            setCode(buildStarter(res.data, language));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        if (problem) setCode(buildStarter(problem, lang));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setResult(null);
        try {
            const res = await interviewApi.post("/submissions", { problemId: Number(id), code, language });
            setResult(res.data);
        } catch (err) {
            setResult({ verdict: "ERROR", output: "Something went wrong submitting." });
        }
        setSubmitting(false);
    };

    const hintCount = items.filter((item) => item.type === "hint").length;
    const isAccepted = result?.verdict === "ACCEPTED";
    const canExplain = result !== null && !isAccepted;
    const canReveal = isAccepted || hintCount >= MAX_HINT_LEVEL;

    const handleGetHint = async () => {
        setTutorBusy("hint");
        setTutorError("");
        const level = Math.min(hintCount + 1, MAX_HINT_LEVEL);
        try {
            const res = await prepApi.post("/tutor/hint", {
                problem_title: problem.title,
                problem_description: problem.description,
                language,
                code,
                level,
                last_verdict: result ? result.verdict : null,
                last_output: result ? result.output : null,
            });
            setItems((prev) => [...prev, { type: "hint", text: res.data.hint }]);
        } catch (err) {
            setTutorError("The tutor is offline. Make sure prep-service is running on port 8082, then try again.");
        }
        setTutorBusy("");
    };

    const handleExplainError = async () => {
        setTutorBusy("error");
        setTutorError("");
        try {
            const res = await prepApi.post("/tutor/explain-error", {
                problem_title: problem.title,
                problem_description: problem.description,
                language,
                code,
                verdict: result.verdict,
                output: result.output,
            });
            setItems((prev) => [...prev, { type: "error", text: res.data.explanation }]);
        } catch (err) {
            setTutorError("The tutor is offline. Make sure prep-service is running on port 8082, then try again.");
        }
        setTutorBusy("");
    };

    const handleRevealSolution = async () => {
        const sure = window.confirm("This shows the full solution. Are you sure you want to see it?");
        if (!sure) return;

        setTutorBusy("solution");
        setTutorError("");
        try {
            const res = await prepApi.post("/tutor/solution", {
                problem_title: problem.title,
                problem_description: problem.description,
                language,
                starter_code: buildStarter(problem, language),
            });
            setItems((prev) => [...prev, { type: "solution", text: res.data.solution }]);
        } catch (err) {
            setTutorError("The tutor is offline. Make sure prep-service is running on port 8082, then try again.");
        }
        setTutorBusy("");
    };

    const handleSuggest = async () => {
        if (!suggestInput.trim() || !suggestOutput.trim()) {
            setSuggestError("Fill in both the input and the expected output.");
            return;
        }
        setSuggestBusy(true);
        setSuggestError("");
        setSuggestMessage("");
        try {
            const res = await interviewApi.post(`/problems/${id}/testcases`, {
                input: suggestInput,
                expectedOutput: suggestOutput,
            });
            setSuggestMessage(
                res.data.status === "APPROVED"
                    ? "Added and approved (you are the admin)."
                    : "Sent! The admin will review it. It is used for grading only after approval."
            );
            setSuggestInput("");
            setSuggestOutput("");
        } catch (err) {
            setSuggestError("Could not send the test case. Please try again.");
        }
        setSuggestBusy(false);
    };

    if (!problem) return <p className="p-6 text-lo text-sm">Loading...</p>;

    let hintNumber = 0;

    return (
        <div className="min-h-screen bg-ink app-bg">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-6 grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
                <div className="space-y-6">
                    <section className="card p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h1 className="font-display font-bold text-2xl text-hi">{problem.title}</h1>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${DIFFICULTY_TEXT[problem.difficulty] || "text-lo"}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {problem.difficulty.toLowerCase()}
                            </span>
                            <span className="chip">{problem.topic}</span>
                        </div>
                        <p className="text-lo leading-relaxed mb-4">{problem.description}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-ink border border-line rounded-xl p-3">
                                <p className="text-xs text-lo mb-1">Sample input</p>
                                <code className="font-mono text-hi whitespace-pre-wrap">{problem.sampleInput}</code>
                            </div>
                            <div className="bg-ink border border-line rounded-xl p-3">
                                <p className="text-xs text-lo mb-1">Sample output</p>
                                <code className="font-mono text-hi whitespace-pre-wrap">{problem.sampleOutput}</code>
                            </div>
                        </div>
                    </section>

                    <section className="card border-l-4 border-l-amber p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-display font-bold text-xl text-hi">AI tutor</h2>
                            <span className="text-sm text-lo">Hints {hintCount} of {MAX_HINT_LEVEL}</span>
                        </div>
                        <div className="flex gap-1.5 mb-4" aria-hidden="true">
                            {Array.from({ length: MAX_HINT_LEVEL }).map((_, i) => (
                                <span key={i} className={`h-1.5 w-8 rounded-full ${i < hintCount ? "bg-amber" : "bg-line"}`} />
                            ))}
                        </div>
                        <p className="text-sm text-lo mb-4">Stuck? Pick what you need. The tutor guides you without handing over the answer.</p>

                        <div className="flex flex-wrap gap-2 mb-2">
                            <button
                                onClick={handleGetHint}
                                disabled={tutorBusy !== "" || hintCount >= MAX_HINT_LEVEL}
                                className="btn btn-grad"
                            >
                                {tutorBusy === "hint" ? "Thinking..." : hintCount >= MAX_HINT_LEVEL ? "No more hints" : "Get a hint"}
                            </button>
                            <button
                                onClick={handleExplainError}
                                disabled={tutorBusy !== "" || !canExplain}
                                title={canExplain ? "" : "Submit your code first. This works after a failed submit."}
                                className="btn hover:border-amber"
                            >
                                {tutorBusy === "error" ? "Thinking..." : "Explain error"}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || tutorBusy !== ""}
                                className="btn hover:border-amber"
                            >
                                {submitting ? "Running..." : "Try again"}
                            </button>
                            <button
                                onClick={handleRevealSolution}
                                disabled={tutorBusy !== "" || !canReveal}
                                title={canReveal ? "" : "Use all 4 hints or solve the problem first."}
                                className="btn hover:border-coral"
                            >
                                {tutorBusy === "solution" ? "Writing..." : "Reveal solution"}
                            </button>
                        </div>

                        {!canReveal && (
                            <p className="text-xs text-lo mb-3">
                                Reveal solution unlocks after you use all 4 hints or solve the problem.
                            </p>
                        )}

                        {tutorError && <p role="alert" className="text-sm text-coral mb-3">{tutorError}</p>}

                        <div className="space-y-3 mt-3">
                            {items.map((item, index) => {
                                if (item.type === "hint") hintNumber += 1;
                                const label =
                                    item.type === "hint" ? `Hint ${hintNumber}` : item.type === "error" ? "What went wrong" : "Full solution";
                                const labelColor =
                                    item.type === "hint" ? "text-amber" : item.type === "error" ? "text-coral" : "text-mint";
                                return (
                                    <div key={index} className="bg-ink border border-line rounded-xl p-4">
                                        <p className={`text-xs font-semibold mb-2 ${labelColor}`}>{label}</p>
                                        <p className={`text-sm text-hi leading-relaxed whitespace-pre-wrap ${item.type === "solution" ? "font-mono" : ""}`}>
                                            {item.text}
                                        </p>
                                        {item.type === "solution" && (
                                            <p className="text-xs text-lo mt-3">
                                                Written by the AI tutor. Paste the code into the editor and submit to check it.
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <div className="space-y-6 min-w-0">
                    <section className="card overflow-hidden">
                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line bg-surfaceRaised">
                            <div className="flex items-center gap-3">
                                <span className="flex gap-1.5" aria-hidden="true">
                                    <span className="w-2.5 h-2.5 rounded-full bg-coral" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-mint" />
                                </span>
                                <label htmlFor="language" className="sr-only">Language</label>
                                <select id="language" value={language} onChange={handleLanguageChange} className="inp !min-h-[40px] !w-auto !py-0 text-sm font-mono">
                                    <option value="python">python</option>
                                    <option value="java">java</option>
                                    <option value="cpp">c++</option>
                                </select>
                            </div>
                            <button onClick={handleSubmit} disabled={submitting} className="btn btn-grad">
                                {submitting ? "Running..." : "Submit"}
                            </button>
                        </div>
                        <Editor
                            height="460px"
                            language={MONACO_LANG[language]}
                            value={code}
                            onChange={(value) => setCode(value)}
                            theme={theme === "light" ? "light" : "vs-dark"}
                            options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 12 } }}
                        />
                    </section>

                    <section className={`card border-l-4 p-5 ${result ? (isAccepted ? "border-l-mint" : "border-l-coral") : "border-l-line"}`}>
                        {result ? (
                            <>
                                <p className={`font-semibold mb-2 ${isAccepted ? "text-mint" : "text-coral"}`}>
                                    {result.verdict.toLowerCase()}
                                </p>
                                <pre className="font-mono text-sm text-lo bg-ink border border-line rounded-xl p-3 whitespace-pre-wrap">
                                    {result.output}
                                </pre>
                            </>
                        ) : (
                            <p className="text-sm text-lo">
                                <span className="font-display font-bold text-hi mr-3">Results</span>
                                Submit your code to see how it does against the tests.
                            </p>
                        )}
                    </section>

                    <section className="card border-l-4 border-l-mint p-6">
                        <h2 className="font-display font-bold text-xl text-hi">Suggest a test case</h2>
                        <p className="text-sm text-lo mt-1 mb-5">
                            Think of an input that could break a solution? Send it to the admin. It is used for grading only after
                            the admin approves it. Write the input in the same format as the sample input.
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2 mb-4">
                            <div>
                                <label htmlFor="suggest-input" className="block text-sm font-medium text-hi mb-1.5">Input</label>
                                <textarea
                                    id="suggest-input"
                                    value={suggestInput}
                                    onChange={(e) => setSuggestInput(e.target.value)}
                                    rows={4}
                                    className="inp py-3 font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="suggest-output" className="block text-sm font-medium text-hi mb-1.5">Expected output</label>
                                <textarea
                                    id="suggest-output"
                                    value={suggestOutput}
                                    onChange={(e) => setSuggestOutput(e.target.value)}
                                    rows={4}
                                    className="inp py-3 font-mono text-sm"
                                />
                            </div>
                        </div>

                        <button onClick={handleSuggest} disabled={suggestBusy} className="btn btn-grad">
                            {suggestBusy ? "Sending..." : "Send for review"}
                        </button>

                        {suggestMessage && <p role="status" className="text-sm text-mint mt-3">{suggestMessage}</p>}
                        {suggestError && <p role="alert" className="text-sm text-coral mt-3">{suggestError}</p>}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default ProblemDetail;