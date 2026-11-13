import { useEffect, useState } from "react";
import api from "../api/api";
import interviewApi from "../api/interviewApi";

function Navbar() {
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };
    return (
        <nav className="bg-surface border-b border-line px-6 py-4 flex items-center justify-between">
      <span className="font-mono font-semibold text-hi text-sm">
        Placement Portal<span className="text-violet animate-blink">▍</span>
      </span>
            <div className="flex items-center gap-6">
                <a href="/dashboard" className="font-mono text-sm text-lo hover:text-hi">
                    Dashboard
                </a>
                <a href="/problems" className="font-mono text-sm text-lo hover:text-hi">
                    Practice
                </a>
                <button onClick={handleLogout} className="font-mono text-sm text-lo hover:text-coral">
                    Log out
                </button>
            </div>
        </nav>
    );
}

function AdminTestCases() {
    const [role, setRole] = useState(null);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    const loadPending = () => {
        interviewApi
            .get("/admin/testcases/pending")
            .then((res) => setPending(res.data))
            .catch(() => setError("Could not load the pending test cases. Is interview-service running?"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        api
            .get("/user/profile")
            .then((res) => {
                setRole(res.data.role);
                if (res.data.role === "ADMIN") {
                    loadPending();
                } else {
                    setLoading(false);
                }
            })
            .catch(() => {
                setError("Session expired, please log in again.");
                setLoading(false);
            });
    }, []);

    const decide = async (id, action) => {
        setBusyId(id);
        setError("");
        try {
            await interviewApi.put(`/admin/testcases/${id}/${action}`);
            setPending((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            setError("That did not work. Log out and log in again as the admin, then retry.");
        }
        setBusyId(null);
    };

    return (
        <div className="min-h-screen bg-ink">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="font-mono text-lg text-hi mb-1">Review test cases</h1>

                {loading && <p className="font-mono text-sm text-lo mt-4">Loading...</p>}

                {!loading && role !== "ADMIN" && (
                    <p className="font-mono text-sm text-coral mt-4">
                        {error || "This page is for the admin only. Log in with the admin account."}
                    </p>
                )}

                {!loading && role === "ADMIN" && (
                    <>
                        <p className="text-sm text-lo mb-6 font-mono">
                            {pending.length} waiting for your review. Approved test cases are used to grade every submission.
                        </p>

                        {error && <p className="font-mono text-xs text-coral mb-4">{error}</p>}

                        {pending.length === 0 && (
                            <p className="font-mono text-sm text-lo bg-surface border border-line rounded-md p-6 text-center">
                                Nothing to review right now.
                            </p>
                        )}

                        <div className="space-y-4">
                            {pending.map((t) => (
                                <div key={t.id} className="bg-surface border border-line border-l-4 border-l-amber rounded-md p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <a
                                            href={`/problems/${t.problemId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-mono text-sm text-hi hover:text-violet"
                                        >
                                            {t.problemTitle}
                                        </a>
                                        <span className="font-mono text-xs text-lo">from {t.submittedBy}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-ink border border-line rounded-md p-3">
                                            <p className="font-mono text-xs text-lo mb-1">input</p>
                                            <pre className="font-mono text-sm text-hi whitespace-pre-wrap">{t.input}</pre>
                                        </div>
                                        <div className="bg-ink border border-line rounded-md p-3">
                                            <p className="font-mono text-xs text-lo mb-1">expected output</p>
                                            <pre className="font-mono text-sm text-hi whitespace-pre-wrap">{t.expectedOutput}</pre>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => decide(t.id, "approve")}
                                            disabled={busyId === t.id}
                                            className="bg-mint hover:bg-mint/90 disabled:bg-mint/40 text-ink font-mono text-sm font-medium rounded-md px-4 py-1.5 transition-colors"
                                        >
                                            approve
                                        </button>
                                        <button
                                            onClick={() => decide(t.id, "reject")}
                                            disabled={busyId === t.id}
                                            className="border border-line text-hi hover:border-coral disabled:opacity-40 font-mono text-sm rounded-md px-4 py-1.5 transition-colors"
                                        >
                                            reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminTestCases;