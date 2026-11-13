import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import interviewApi from "../api/interviewApi";
import Navbar from "../components/Navbar";

const RING_LENGTH = 2 * Math.PI * 42;

function StudentDashboard() {
    const [profile, setProfile] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [resume, setResume] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/user/profile").then((res) => setProfile(res.data)).catch(() => setError("Session expired, please log in again."));
        interviewApi.get("/submissions/analytics").then((res) => setAnalytics(res.data)).catch(() => {});
        api.get("/resume/mine").then((res) => setResume(res.data)).catch(() => {});
    }, []);

    const handleDownload = () => {
        api.get("/resume/download", { responseType: "blob" }).then((res) => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", resume.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await api.post("/resume/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResume(res.data);
        } catch (err) {
            alert(err.response?.data || "Upload failed");
        }
        setUploading(false);
    };

    if (error) return <p role="alert" className="p-6 text-coral text-sm">{error}</p>;
    if (!profile) return <p className="p-6 text-lo text-sm">Loading...</p>;

    // Weakest topic first, so students see what to work on at the top.
    const chartData = analytics
        .map((t) => ({
            topic: t.topic,
            strength: t.attempts > 0 ? Math.round((t.passed / t.attempts) * 100) : 0,
        }))
        .sort((a, b) => a.strength - b.strength);

    const overall = chartData.length
        ? Math.round(chartData.reduce((sum, t) => sum + t.strength, 0) / chartData.length)
        : 0;
    const weakest = chartData[0];

    return (
        <div className="min-h-screen bg-ink app-bg">
            <Navbar />
            <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                <section className="card p-7 grid gap-6 items-center sm:grid-cols-[auto_1fr_auto]">
                    <svg width="112" height="112" viewBox="0 0 100 100" role="img" aria-label={`Overall strength ${overall} percent`}>
                        <defs>
                            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" style={{ stopColor: "rgb(var(--violet))" }} />
                                <stop offset="1" style={{ stopColor: "rgb(var(--mint))" }} />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" style={{ stroke: "rgb(var(--line))" }} />
                        <circle
                            cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
                            stroke="url(#ringGrad)"
                            strokeDasharray={`${(overall / 100) * RING_LENGTH} ${RING_LENGTH}`}
                            transform="rotate(-90 50 50)"
                        />
                        <text x="50" y="57" textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="Space Grotesk" style={{ fill: "rgb(var(--hi))" }}>
                            {overall}%
                        </text>
                    </svg>
                    <div>
                        <p className="text-sm text-lo">Welcome back</p>
                        <h1 className="font-display font-bold text-3xl text-hi mt-0.5">{profile.name}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-lo">
                            <span>{profile.email}</span>
                            <span className="chip">{profile.role.toLowerCase()}</span>
                        </div>
                        <p className="mt-3 text-lo">
                            {weakest
                                ? `Your overall strength across ${chartData.length} topics. ${weakest.topic} needs the most work.`
                                : "Solve a few problems and your strengths will show up here."}
                        </p>
                    </div>
                    <Link to="/problems" className="btn btn-grad min-h-[50px]">
                        {weakest ? `Practice ${weakest.topic}` : "Start practicing"}
                    </Link>
                </section>

                <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
                    <section className="card p-7">
                        <h2 className="font-display font-bold text-xl text-hi">Topic strength</h2>
                        <p className="text-sm text-lo mt-1 mb-5">Weakest first, based on your submission history.</p>

                        {chartData.length === 0 ? (
                            <p className="text-sm text-lo py-10 text-center">
                                Solve a few problems to see your topic-wise strength here.
                            </p>
                        ) : (
                            <ul className="space-y-4">
                                {chartData.map((t) => (
                                    <li key={t.topic} className="grid grid-cols-[96px_1fr_44px] items-center gap-3 text-sm">
                                        <span className="font-medium text-hi truncate">{t.topic}</span>
                                        <div className="h-3 rounded-full bg-line overflow-hidden" role="img" aria-label={`${t.topic} strength ${t.strength} percent`}>
                                            <div
                                                className={`h-full rounded-full ${t.strength < 50 ? "bg-amber" : "bg-mint"}`}
                                                style={{ width: `${t.strength}%` }}
                                            />
                                        </div>
                                        <span className="font-mono text-xs text-lo text-right">{t.strength}%</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="card p-7">
                        <h2 className="font-display font-bold text-xl text-hi">Your resume</h2>
                        <p className="text-sm text-lo mt-1 mb-5">Upload a PDF. It stays attached to your profile.</p>

                        {resume && (
                            <div className="flex items-center gap-3 bg-ink border border-line rounded-xl p-4 mb-4">
                                <span className="logo rounded-lg">PDF</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-hi truncate">{resume.fileName}</p>
                                    <p className="text-xs text-lo">Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {resume && (
                                <button onClick={handleDownload} className="btn">Download</button>
                            )}
                            <label className="btn cursor-pointer focus-within:ring-2 focus-within:ring-violet">
                                {uploading ? "Uploading..." : resume ? "Replace resume" : "Upload resume"}
                                <input type="file" accept=".pdf" onChange={handleResumeUpload} className="sr-only" />
                            </label>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default StudentDashboard;
