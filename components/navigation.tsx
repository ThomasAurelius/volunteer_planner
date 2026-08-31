import Link from "next/link";

import { organizations } from "@/lib/mvp-data";
import { LogoutButton } from "@/components/logout-button";

type NavigationProps = {
  organizationSlug: string;
};

export function Navigation({ organizationSlug }: NavigationProps) {
  const query = `?org=${organizationSlug}`;

  return (
    <header className="border-b border-indigo-200 bg-indigo-900">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-sm text-indigo-200">Volunteer Operations</p>
          <h1 className="text-lg font-semibold text-white">Volunteer Planner MVP</h1>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link className="text-indigo-100 hover:text-white" href={`/${query}`}>
            Dashboard
          </Link>
          <Link className="text-indigo-100 hover:text-white" href={`/projects${query}`}>
            Projects
          </Link>
          <Link className="text-indigo-100 hover:text-white" href={`/schedule${query}`}>
            Schedule
          </Link>
          <Link className="text-indigo-100 hover:text-white" href={`/people${query}`}>
            People
          </Link>
          <Link className="text-indigo-100 hover:text-white" href={`/volunteer${query}`}>
            Volunteer Portal
          </Link>
          <Link className="text-indigo-100 hover:text-white" href={`/settings${query}`}>
            Organization Settings
          </Link>
          <Link className="text-indigo-100 hover:text-white" href={`/admin${query}`}>
            Admin
          </Link>
          <LogoutButton />
        </nav>
      </div>
      <div className="mx-auto flex w-full max-w-6xl gap-2 px-6 pb-4 text-xs text-indigo-100">
        {organizations.map((organization) => {
          const selected = organization.slug === organizationSlug;
          return (
            <Link
              key={organization.id}
              href={`?org=${organization.slug}`}
              className={`rounded-full px-3 py-1 ${selected ? "bg-white text-indigo-900 font-semibold" : "bg-indigo-700 text-white hover:bg-indigo-600"}`}
            >
              {organization.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
