export const PEOPLE_ROLES = ["volunteer", "manager", "admin"] as const;
export type PeopleRole = (typeof PEOPLE_ROLES)[number];

export type PersonPayload = {
  displayName?: unknown;
  realName?: unknown;
  email?: unknown;
  phone?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parsePersonPayload(payload: PersonPayload) {
  const displayName = text(payload.displayName);
  const realName = text(payload.realName);
  const email = text(payload.email).toLowerCase();
  const phone = text(payload.phone);

  if (!displayName || !realName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    return null;
  }

  return { displayName, realName, email, phone };
}

export function parseRole(value: unknown): PeopleRole {
  return PEOPLE_ROLES.includes(value as PeopleRole) ? (value as PeopleRole) : "volunteer";
}

export async function getLivePeople(organizationId: string) {
  const db = await getDb();
  const memberships = await db.collection("memberships").find({ organizationId, status: "active" }).toArray();
  const ids = memberships
    .map((membership) => String(membership.personId))
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));
  if (!ids.length) return [];
  const people = await db.collection("users").find({ _id: { $in: ids } }).toArray();
  const roleByPerson = new Map(memberships.map((membership) => [String(membership.personId), parseRole(membership.role)]));
  return people.map((person) => ({
    id: person._id.toString(),
    displayName: (person.displayName as string) || (person.email as string).split("@")[0],
    realName: (person.realName as string) || "",
    email: person.email as string,
    phone: (person.phone as string) || "",
    role: roleByPerson.get(person._id.toString()) ?? "volunteer",
  }));
}
import { ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";
