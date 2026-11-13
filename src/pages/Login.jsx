import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import AuthLayout from "../components/AuthLayout";

function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await api.post("/auth/login", form);
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <AuthLayout hero>
            <h2 className="font-display font-bold text-3xl text-hi mb-1">Welcome back</h2>
            <p className="text-lo mb-7">Log in to access your practice dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-hi mb-1.5">Email</label>
                    <input id="email" name="email" type="email" autoComplete="email" placeholder="you@college.edu"
                           onChange={handleChange} required className="inp" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-hi mb-1.5">Password</label>
                    <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Your password"
                           onChange={handleChange} required className="inp" />
                </div>

                {error && (
                    <p role="alert" className="text-sm text-coral bg-coral/10 border border-coral/30 rounded-xl px-4 py-3">
                        {error}
                    </p>
                )}

                <button type="submit" className="btn btn-grad w-full min-h-[52px] text-base">Log in</button>
            </form>

            <p className="text-sm text-lo text-center mt-7">
                No account?{" "}
                <a href="/register" className="text-violet font-semibold hover:underline">Register</a>
            </p>
        </AuthLayout>
    );
}

export default Login;
