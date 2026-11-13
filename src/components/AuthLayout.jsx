import ThemeToggle from "./ThemeToggle";

function AuthLayout({ hero = false, children }) {
    return (
        <div className="min-h-screen bg-ink app-bg flex flex-col">
            <header className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2.5">
                    <span className="logo">{"</>"}</span>
                    <span className="font-display font-bold text-lg text-hi">Placement Portal</span>
                </div>
                <ThemeToggle />
            </header>
            <main className={`flex-1 grid gap-10 items-center px-6 pb-12 ${hero ? "lg:grid-cols-2 lg:px-[6%]" : ""}`}>
                {hero && (
                    <section className="hidden lg:flex flex-col gap-6">
                        <h1 className="font-display font-bold text-5xl leading-tight text-hi">
                            Code. Practice.
                            <br />
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--violet)), rgb(var(--mint)))" }}
                            >
                                Get placed.
                            </span>
                        </h1>
                        <p className="text-lg text-lo leading-relaxed max-w-md">
                            Solve problems with an AI tutor beside you, and watch your strengths grow topic by topic.
                        </p>
                        <div className="card max-w-sm p-5 font-mono text-sm leading-7 -rotate-1">
                            <div className="text-lo"># two_sum.py</div>
                            <div><span className="text-violet">def</span> two_sum(nums, target):</div>
                            <div className="pl-4">seen = {"{}"}</div>
                            <div className="pl-4 text-lo"># hint: remember what you have seen</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="chip">AI hints</span>
                            <span className="chip">Topic analytics</span>
                            <span className="chip">Resume prep</span>
                        </div>
                    </section>
                )}
                <section className="card w-full max-w-md justify-self-center p-8 sm:p-10">{children}</section>
            </main>
        </div>
    );
}

export default AuthLayout;
