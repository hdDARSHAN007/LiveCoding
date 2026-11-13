import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import interviewApi from "../api/interviewApi";
import Navbar from "../components/Navbar";

const DIFFICULTY_TEXT = { EASY: "text-mint", MEDIUM: "text-amber", HARD: "text-coral" };

// The order categories appear in. Any category not listed here is shown at the end.
const TOPIC_ORDER = [
    "Arrays",
    "Strings",
    "HashMap",
    "HashSet",
    "Stack",
    "Binary Search",
    "Linked List",
    "Binary Tree",
    "BST",
    "Graphs",
    "Recursion",
    "DP",
];

const TOPIC_LABEL = { DP: "Dynamic Programming" };

function topicLabel(topic) {
    return TOPIC_LABEL[topic] || topic;
}

function topicRank(topic) {
    const index = TOPIC_ORDER.indexOf(topic);
    return index === -1 ? TOPIC_ORDER.length : index;
}

function ProblemList() {
    const [problems, setProblems] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        interviewApi.get("/problems").then((res) => setProblems(res.data));
    }, []);

    // Group the problems by category
    const groups = {};
    problems.forEach((p) => {
        if (!groups[p.topic]) groups[p.topic] = [];
        groups[p.topic].push(p);
    });

    const topics = Object.keys(groups).sort(
        (a, b) => topicRank(a) - topicRank(b) || a.localeCompare(b)
    );
    const visibleTopics = selectedTopic === "All" ? topics : topics.filter((t) => t === selectedTopic);

    const chipClass = (active) =>
        `min-h-[40px] px-4 rounded-full border text-sm font-semibold transition-colors ${
            active
                ? "btn-grad border-transparent"
                : "border-line bg-surface text-lo hover:text-hi hover:border-violet"
        }`;

    return (
        <div className="min-h-screen bg-ink app-bg">
            <Navbar />
            <main className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="font-display font-bold text-3xl text-hi">Practice problems</h1>
                <p className="text-lo mt-1 mb-6">
                    {problems.length} problems in {topics.length} categories. Pick a topic to focus on.
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                    <button type="button" aria-pressed={selectedTopic === "All"} onClick={() => setSelectedTopic("All")} className={chipClass(selectedTopic === "All")}>
                        All ({problems.length})
                    </button>
                    {topics.map((topic) => (
                        <button
                            key={topic}
                            type="button"
                            aria-pressed={selectedTopic === topic}
                            onClick={() => setSelectedTopic(topic)}
                            className={chipClass(selectedTopic === topic)}
                        >
                            {topicLabel(topic)} ({groups[topic].length})
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    {visibleTopics.map((topic) => (
                        <section key={topic}>
                            <h2 className="font-display font-bold text-lg text-hi mb-3">
                                {topicLabel(topic)}
                                <span className="text-lo font-medium"> ({groups[topic].length})</span>
                            </h2>
                            <div className="space-y-3">
                                {groups[topic].map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => navigate(`/problems/${p.id}`)}
                                        className="card w-full p-5 flex items-center justify-between gap-4 text-left transition-colors hover:border-violet"
                                    >
                                        <h3 className="font-semibold text-hi">{p.title}</h3>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${DIFFICULTY_TEXT[p.difficulty] || "text-lo"}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {p.difficulty.toLowerCase()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default ProblemList;