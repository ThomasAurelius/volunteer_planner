"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [realName, setRealName] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/organizations")
      .then((response) => (response.ok ? response.json() : { organizations: [] }))
      .then((data: { organizations?: { id: string; name: string }[] }) => setOrganizations(data.organizations ?? []))
      .catch(() => setOrganizations([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName, realName, phone, organizationId }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      try {
        const data = await res.json();
        setError(data.error ?? "Sign up failed");
      } catch {
        setError("Sign up failed");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Create account</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-900 underline">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-1">
            <label htmlFor="displayName" className="text-sm font-medium text-zinc-700">Display name</label>
            <input id="displayName" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          </div>

          <div className="grid gap-1">
            <label htmlFor="realName" className="text-sm font-medium text-zinc-700">Real name</label>
            <input id="realName" required value={realName} onChange={(e) => setRealName(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          </div>

          <div className="grid gap-1">
            <label htmlFor="phone" className="text-sm font-medium text-zinc-700">Contact number</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          </div>

          <div className="grid gap-1">
            <label htmlFor="organization" className="text-sm font-medium text-zinc-700">Join an organization</label>
            <select id="organization" value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              <option value="">No organization yet</option>
              {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
            </select>
          </div>

          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="confirm" className="text-sm font-medium text-zinc-700">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
