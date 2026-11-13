import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import AuthLayout from "../components/AuthLayout";

function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await api.post("/auth/register", form);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data || "Registration failed");
        }
    };

    return (
        <AuthLayout>
            <h2 className="font-display font-bold text-3xl text-hi mb-1">Create account</h2>
            <p className="text-lo mb-7">Start practicing coding problems.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-hi mb-1.5">Name</label>
                    <input id="name" name="name" autoComplete="name" onChange={handleChange} required className="inp" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-hi mb-1.5">Email</label>
                    <input id="email" name="email" type="email" autoComplete="email" placeholder="you@college.edu"
                           onChange={handleChange} required className="inp" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-hi mb-1.5">Password</label>
                    <input id="password" name="password" type="password" autoComplete="new-password"
                           onChange={handleChange} required className="inp" />
                </div>

                {error && (
                    <p role="alert" className="text-sm text-coral bg-coral/10 border border-coral/30 rounded-xl px-4 py-3">
                        {JSON.stringify(error)}
                    </p>
                )}

                <button type="submit" className="btn btn-grad w-full min-h-[52px] text-base">Create account</button>
            </form>

            <p className="text-sm text-lo text-center mt-7">
                Already have an account?{" "}
                <a href="/login" className="text-violet font-semibold hover:underline">Log in</a>
            </p>
        </AuthLayout>
    );
}

export default Register;
