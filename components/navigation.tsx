import Link from "next/link";

import { organizations } from "@/lib/mvp-data";

type NavigationProps = {
  organizationSlug: string;
};

export function Navigation({ organizationSlug }: NavigationProps) {
  const query = `?org=${organizationSlug}`;

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-sm text-zinc-500">Volunteer Operations</p>
          <h1 className="text-lg font-semibold text-zinc-900">Volunteer Planner MVP</h1>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link className="text-zinc-700 hover:text-zinc-900" href={`/${query}`}>
            Dashboard
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-900" href={`/projects${query}`}>
            Projects
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-900" href={`/schedule${query}`}>
            Schedule
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-900" href={`/people${query}`}>
            People
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-900" href={`/volunteer${query}`}>
            Volunteer Portal
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-900" href={`/settings${query}`}>
            Organization Settings
          </Link>
        </nav>
      </div>
      <div className="mx-auto flex w-full max-w-6xl gap-2 px-6 pb-4 text-xs text-zinc-600">
        {organizations.map((organization) => {
          const selected = organization.slug === organizationSlug;
          return (
            <Link
              key={organization.id}
              href={`?org=${organization.slug}`}
              className={`rounded-full px-3 py-1 ${selected ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
            >
              {organization.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
