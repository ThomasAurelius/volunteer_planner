import { ObjectId } from "mongodb";

import { getDb } from "./mongodb";
import { getProjectDetail, organizations, type Role, type Shift } from "./mvp-data";

type ProjectPageData = {
  organizationSlug: string;
  project: {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    location: string;
    status: string;
  };
  roles: Role[];
  shifts: Shift[];
};

export async function getProjectPageData(projectId: string, organizationSlug?: string): Promise<ProjectPageData | null> {
  const staticDetail = getProjectDetail(projectId);

  if (staticDetail) {
    const organization = organizations.find((item) => item.id === staticDetail.project.organizationId);

    return {
      organizationSlug: organization?.slug ?? organizationSlug ?? "",
      project: {
        id: staticDetail.project.id,
        organizationId: staticDetail.project.organizationId,
        name: staticDetail.project.name,
        description: staticDetail.project.description ?? "",
        location: staticDetail.project.location ?? "",
        status: staticDetail.project.status,
      },
      roles: staticDetail.roles,
      shifts: staticDetail.shifts,
    };
  }

  if (!ObjectId.isValid(projectId)) {
    return null;
  }

  const db = await getDb();
  const projectDoc = await db.collection("projects").findOne({ _id: new ObjectId(projectId) });

  if (!projectDoc) {
    return null;
  }

  let resolvedOrganizationSlug = organizationSlug ?? "";
  const storedOrganizationId =
    typeof projectDoc.organizationId === "string" ? projectDoc.organizationId : "";

  if (ObjectId.isValid(storedOrganizationId)) {
    const organizationDoc = await db
      .collection("organizations")
      .findOne({ _id: new ObjectId(storedOrganizationId) });

    if (typeof organizationDoc?.slug === "string" && organizationDoc.slug) {
      resolvedOrganizationSlug = organizationDoc.slug;
    }
  }

  return {
    organizationSlug: resolvedOrganizationSlug,
    project: {
      id: projectDoc._id.toString(),
      organizationId: storedOrganizationId,
      name: typeof projectDoc.name === "string" ? projectDoc.name : "",
      description: typeof projectDoc.description === "string" ? projectDoc.description : "",
      location: typeof projectDoc.location === "string" ? projectDoc.location : "",
      status: typeof projectDoc.status === "string" ? projectDoc.status : "active",
    },
    roles: [],
    shifts: [],
  };
}
