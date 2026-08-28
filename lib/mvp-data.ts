export type Organization = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  createdAt: string;
};

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type MembershipRole = "volunteer" | "coordinator" | "admin";

export type OrganizationMembership = {
  id: string;
  organizationId: string;
  personId: string;
  role: MembershipRole;
  status: "active" | "inactive";
};

export type Project = {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  location?: string;
  status: "active" | "archived";
  coordinatorId?: string;
};

export type Role = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
};

export type Shift = {
  id: string;
  projectId: string;
  title: string;
  startAt: string;
  endAt: string;
  location?: string;
  notes?: string;
  status: "draft" | "published" | "cancelled" | "completed";
};

export type ShiftRequirement = {
  id: string;
  shiftId: string;
  roleId: string;
  quantity: number;
  allowSelfSignup: boolean;
};

export type Assignment = {
  id: string;
  shiftId: string;
  personId: string;
  roleId: string;
  status: "assigned" | "confirmed" | "declined";
  notes?: string;
};

export type Availability = {
  id: string;
  personId: string;
  organizationId: string;
  startAt: string;
  endAt: string;
  status: "available" | "unavailable";
};

export const organizations: Organization[] = [
  {
    id: "org_ama",
    name: "Austin Mutual Aid",
    slug: "austin-mutual-aid",
    timezone: "America/Chicago",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "org_cfn",
    name: "Community Food Network",
    slug: "community-food-network",
    timezone: "America/Chicago",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

export const people: Person[] = [
  { id: "person_maria", firstName: "Maria", lastName: "Garcia", email: "maria@example.org" },
  { id: "person_alex", firstName: "Alex", lastName: "Reed", email: "alex@example.org" },
  { id: "person_james", firstName: "James", lastName: "Lee", email: "james@example.org" },
  { id: "person_sarah", firstName: "Sarah", lastName: "Chen", email: "sarah@example.org" },
  { id: "person_mike", firstName: "Mike", lastName: "Torres", email: "mike@example.org" },
  { id: "person_rebecca", firstName: "Rebecca", lastName: "Shaw", email: "rebecca@example.org" },
  { id: "person_david", firstName: "David", lastName: "Brooks", email: "david@example.org" },
  { id: "person_jennifer", firstName: "Jennifer", lastName: "Green", email: "jennifer@example.org" },
];

export const memberships: OrganizationMembership[] = [
  { id: "m1", organizationId: "org_ama", personId: "person_maria", role: "coordinator", status: "active" },
  { id: "m2", organizationId: "org_ama", personId: "person_alex", role: "volunteer", status: "active" },
  { id: "m3", organizationId: "org_ama", personId: "person_james", role: "volunteer", status: "active" },
  { id: "m4", organizationId: "org_ama", personId: "person_sarah", role: "volunteer", status: "active" },
  { id: "m5", organizationId: "org_ama", personId: "person_mike", role: "volunteer", status: "active" },
  { id: "m6", organizationId: "org_ama", personId: "person_rebecca", role: "volunteer", status: "active" },
  { id: "m7", organizationId: "org_ama", personId: "person_david", role: "volunteer", status: "active" },
  { id: "m8", organizationId: "org_ama", personId: "person_jennifer", role: "volunteer", status: "active" },
  { id: "m9", organizationId: "org_cfn", personId: "person_maria", role: "admin", status: "active" },
  { id: "m10", organizationId: "org_cfn", personId: "person_alex", role: "coordinator", status: "active" },
];

export const projects: Project[] = [
  {
    id: "project_food",
    organizationId: "org_ama",
    name: "Food Distribution",
    description: "Weekly pantry support and neighborhood distribution.",
    location: "Central Food Pantry",
    status: "active",
    coordinatorId: "person_maria",
  },
  {
    id: "project_cleanup",
    organizationId: "org_ama",
    name: "Community Cleanup",
    description: "Weekend cleanup crews around the district.",
    location: "Riverside Park",
    status: "active",
    coordinatorId: "person_maria",
  },
];

export const roles: Role[] = [
  { id: "role_team_lead", projectId: "project_food", name: "Team Lead" },
  { id: "role_driver", projectId: "project_food", name: "Driver" },
  { id: "role_general", projectId: "project_food", name: "General Volunteer" },
  { id: "role_cleanup_general", projectId: "project_cleanup", name: "General Volunteer" },
  { id: "role_cleanup_lead", projectId: "project_cleanup", name: "Team Lead" },
];

export const shifts: Shift[] = [
  {
    id: "shift_food_sat_1",
    projectId: "project_food",
    title: "Saturday Food Distribution",
    startAt: "2026-09-12T15:00:00.000Z",
    endAt: "2026-09-12T19:00:00.000Z",
    location: "Central Food Pantry",
    status: "published",
  },
  {
    id: "shift_cleanup_sun_1",
    projectId: "project_cleanup",
    title: "Sunday Community Cleanup",
    startAt: "2026-09-13T14:00:00.000Z",
    endAt: "2026-09-13T17:00:00.000Z",
    location: "Riverside Park",
    status: "published",
  },
  {
    id: "shift_food_setup",
    projectId: "project_food",
    title: "Distribution Setup",
    startAt: "2026-09-12T13:00:00.000Z",
    endAt: "2026-09-12T16:00:00.000Z",
    location: "Central Food Pantry",
    status: "published",
  },
];

export const requirements: ShiftRequirement[] = [
  { id: "req1", shiftId: "shift_food_sat_1", roleId: "role_team_lead", quantity: 1, allowSelfSignup: false },
  { id: "req2", shiftId: "shift_food_sat_1", roleId: "role_driver", quantity: 2, allowSelfSignup: true },
  { id: "req3", shiftId: "shift_food_sat_1", roleId: "role_general", quantity: 6, allowSelfSignup: true },
  { id: "req4", shiftId: "shift_cleanup_sun_1", roleId: "role_cleanup_lead", quantity: 1, allowSelfSignup: false },
  { id: "req5", shiftId: "shift_cleanup_sun_1", roleId: "role_cleanup_general", quantity: 2, allowSelfSignup: true },
  { id: "req6", shiftId: "shift_food_setup", roleId: "role_general", quantity: 2, allowSelfSignup: true },
];

export const assignments: Assignment[] = [
  { id: "a1", shiftId: "shift_food_sat_1", personId: "person_maria", roleId: "role_team_lead", status: "confirmed" },
  { id: "a2", shiftId: "shift_food_sat_1", personId: "person_alex", roleId: "role_driver", status: "confirmed" },
  { id: "a3", shiftId: "shift_food_sat_1", personId: "person_james", roleId: "role_general", status: "assigned" },
  { id: "a4", shiftId: "shift_food_sat_1", personId: "person_sarah", roleId: "role_general", status: "assigned" },
  { id: "a5", shiftId: "shift_food_sat_1", personId: "person_mike", roleId: "role_general", status: "confirmed" },
  { id: "a6", shiftId: "shift_food_sat_1", personId: "person_rebecca", roleId: "role_general", status: "assigned" },
  { id: "a7", shiftId: "shift_food_setup", personId: "person_david", roleId: "role_general", status: "confirmed" },
  { id: "a8", shiftId: "shift_cleanup_sun_1", personId: "person_alex", roleId: "role_cleanup_general", status: "assigned" },
];

export const availability: Availability[] = [
  {
    id: "av1",
    personId: "person_sarah",
    organizationId: "org_ama",
    startAt: "2026-09-12T13:00:00.000Z",
    endAt: "2026-09-12T22:00:00.000Z",
    status: "available",
  },
  {
    id: "av2",
    personId: "person_david",
    organizationId: "org_ama",
    startAt: "2026-09-12T13:00:00.000Z",
    endAt: "2026-09-12T15:00:00.000Z",
    status: "available",
  },
  {
    id: "av3",
    personId: "person_jennifer",
    organizationId: "org_ama",
    startAt: "2026-09-12T15:00:00.000Z",
    endAt: "2026-09-12T19:00:00.000Z",
    status: "unavailable",
  },
];

export function formatDateRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${start.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function getOrganizationBySlug(slug?: string): Organization {
  if (!slug) return organizations[0];
  return organizations.find((organization) => organization.slug === slug) ?? organizations[0];
}

export function getPeopleForOrganization(organizationId: string): Person[] {
  const personIds = memberships
    .filter((membership) => membership.organizationId === organizationId && membership.status === "active")
    .map((membership) => membership.personId);

  return people.filter((person) => personIds.includes(person.id));
}

export function getProjectsForOrganization(organizationId: string): Project[] {
  return projects.filter((project) => project.organizationId === organizationId && project.status === "active");
}

export function getShiftsForOrganization(organizationId: string): Shift[] {
  const projectIds = getProjectsForOrganization(organizationId).map((project) => project.id);
  return shifts
    .filter((shift) => projectIds.includes(shift.projectId) && shift.status !== "cancelled")
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
}

export function getShiftCoverage(shiftId: string) {
  const shiftRequirements = requirements.filter((requirement) => requirement.shiftId === shiftId);
  const shiftAssignments = assignments.filter(
    (assignment) => assignment.shiftId === shiftId && assignment.status !== "declined",
  );

  const positions = shiftRequirements.reduce((sum, requirement) => sum + requirement.quantity, 0);
  const assigned = shiftAssignments.length;

  return {
    positions,
    assigned,
    open: Math.max(positions - assigned, 0),
    percentage: positions === 0 ? 0 : Math.round((assigned / positions) * 100),
  };
}

export function hasSchedulingConflict(personId: string, shiftId: string): boolean {
  const targetShift = shifts.find((shift) => shift.id === shiftId);
  if (!targetShift) return false;

  const targetStart = +new Date(targetShift.startAt);
  const targetEnd = +new Date(targetShift.endAt);

  return assignments.some((assignment) => {
    if (assignment.personId !== personId || assignment.shiftId === shiftId || assignment.status === "declined") {
      return false;
    }

    const otherShift = shifts.find((shift) => shift.id === assignment.shiftId);
    if (!otherShift) return false;

    const otherStart = +new Date(otherShift.startAt);
    const otherEnd = +new Date(otherShift.endAt);

    return targetStart < otherEnd && otherStart < targetEnd;
  });
}

function getAvailabilityStatus(personId: string, organizationId: string, shiftId: string): "available" | "unavailable" | "unknown" {
  const shift = shifts.find((item) => item.id === shiftId);
  if (!shift) return "unknown";

  const window = availability.find((item) => {
    if (item.personId !== personId || item.organizationId !== organizationId) return false;
    return +new Date(item.startAt) <= +new Date(shift.startAt) && +new Date(item.endAt) >= +new Date(shift.endAt);
  });

  return window?.status ?? "unknown";
}

const scoreMap = {
  available_no_conflict: 4,
  available_conflict: 3,
  unknown: 2,
  unavailable: 1,
} as const;

export function getSuggestedVolunteers(organizationId: string, shiftId: string, roleId: string) {
  const roleAssignments = assignments
    .filter((assignment) => assignment.shiftId === shiftId && assignment.roleId === roleId && assignment.status !== "declined")
    .map((assignment) => assignment.personId);

  return getPeopleForOrganization(organizationId)
    .filter((person) => !roleAssignments.includes(person.id))
    .map((person) => {
      const availabilityStatus = getAvailabilityStatus(person.id, organizationId, shiftId);
      const conflict = hasSchedulingConflict(person.id, shiftId);

      let score: number = scoreMap.unknown;
      if (availabilityStatus === "available") {
        score = conflict ? scoreMap.available_conflict : scoreMap.available_no_conflict;
      } else if (availabilityStatus === "unavailable") {
        score = scoreMap.unavailable;
      }

      return {
        person,
        availabilityStatus,
        conflict,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || a.person.lastName.localeCompare(b.person.lastName));
}

export function getDashboardData(organizationId: string) {
  const orgShifts = getShiftsForOrganization(organizationId);

  const coverage = orgShifts.reduce(
    (summary, shift) => {
      const shiftCoverage = getShiftCoverage(shift.id);
      summary.positions += shiftCoverage.positions;
      summary.assigned += shiftCoverage.assigned;
      summary.open += shiftCoverage.open;
      return summary;
    },
    { positions: 0, assigned: 0, open: 0 },
  );

  const upcoming = {
    today: orgShifts.filter((shift) => new Date(shift.startAt).getUTCDate() === 12).length,
    tomorrow: orgShifts.filter((shift) => new Date(shift.startAt).getUTCDate() === 13).length,
    weekend: orgShifts.length,
  };

  const needsAttention = orgShifts
    .map((shift) => ({ shift, coverage: getShiftCoverage(shift.id) }))
    .filter(({ coverage }) => coverage.open > 0)
    .slice(0, 5);

  return {
    shifts: orgShifts.length,
    positions: coverage.positions,
    assigned: coverage.assigned,
    percentage: coverage.positions === 0 ? 0 : Math.round((coverage.assigned / coverage.positions) * 100),
    needsAttention,
    upcoming,
  };
}

export function getProjectDetail(projectId: string) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return null;

  const projectRoles = roles.filter((role) => role.projectId === project.id);
  const projectShifts = shifts.filter((shift) => shift.projectId === project.id);
  const projectAssignments = assignments.filter((assignment) =>
    projectShifts.some((shift) => shift.id === assignment.shiftId),
  );

  return {
    project,
    roles: projectRoles,
    shifts: projectShifts,
    assignments: projectAssignments,
  };
}

export function getShiftDetail(shiftId: string) {
  const shift = shifts.find((item) => item.id === shiftId);
  if (!shift) return null;

  const project = projects.find((item) => item.id === shift.projectId);
  if (!project) return null;

  const shiftRequirements = requirements.filter((item) => item.shiftId === shiftId);
  const grouped = shiftRequirements.map((requirement) => {
    const role = roles.find((item) => item.id === requirement.roleId);
    const roleAssignments = assignments.filter(
      (assignment) => assignment.shiftId === shiftId && assignment.roleId === requirement.roleId && assignment.status !== "declined",
    );

    const assignedPeople = roleAssignments
      .map((assignment) => ({
        assignment,
        person: people.find((person) => person.id === assignment.personId),
      }))
      .filter((item): item is { assignment: Assignment; person: Person } => Boolean(item.person));

    return {
      requirement,
      role,
      assignedPeople,
      openSlots: Math.max(requirement.quantity - assignedPeople.length, 0),
      suggestions: getSuggestedVolunteers(project.organizationId, shiftId, requirement.roleId).slice(0, 3),
    };
  });

  return {
    shift,
    project,
    coverage: getShiftCoverage(shiftId),
    grouped,
  };
}

export function getPersonDetail(personId: string, organizationId: string) {
  const person = people.find((item) => item.id === personId);
  if (!person) return null;

  const personMembership = memberships.find(
    (membership) => membership.personId === personId && membership.organizationId === organizationId,
  );

  const personAssignments = assignments
    .filter((assignment) => assignment.personId === personId)
    .map((assignment) => {
      const shift = shifts.find((item) => item.id === assignment.shiftId);
      const role = roles.find((item) => item.id === assignment.roleId);
      const project = shift ? projects.find((item) => item.id === shift.projectId) : undefined;
      return { assignment, shift, role, project };
    })
    .filter((item): item is { assignment: Assignment; shift: Shift; role: Role; project: Project } => {
      return Boolean(item.shift && item.role && item.project);
    });

  const personAvailability = availability.filter(
    (item) => item.personId === personId && item.organizationId === organizationId,
  );

  return {
    person,
    membership: personMembership,
    assignments: personAssignments,
    availability: personAvailability,
  };
}

export function getVolunteerPortal(personId: string, organizationId: string) {
  const myAssignments = assignments
    .filter((assignment) => assignment.personId === personId && assignment.status !== "declined")
    .map((assignment) => {
      const shift = shifts.find((item) => item.id === assignment.shiftId);
      const role = roles.find((item) => item.id === assignment.roleId);
      const project = shift ? projects.find((item) => item.id === shift.projectId) : undefined;
      return { assignment, shift, role, project };
    })
    .filter((item): item is { assignment: Assignment; shift: Shift; role: Role; project: Project } => {
      return Boolean(item.shift && item.role && item.project);
    });

  const openShifts = getShiftsForOrganization(organizationId)
    .map((shift) => ({ shift, coverage: getShiftCoverage(shift.id) }))
    .filter(({ coverage }) => coverage.open > 0);

  return {
    myAssignments,
    openShifts,
    availability: availability.filter((item) => item.personId === personId && item.organizationId === organizationId),
  };
}
