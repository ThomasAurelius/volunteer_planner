import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const projectFindOneMock = vi.fn();
  const organizationFindOneMock = vi.fn();
  const collectionMock = vi.fn((name: string) => {
    if (name === "projects") {
      return { findOne: projectFindOneMock };
    }

    if (name === "organizations") {
      return { findOne: organizationFindOneMock };
    }

    return { findOne: vi.fn() };
  });
  const getDbMock = vi.fn(async () => ({ collection: collectionMock }));

  return { projectFindOneMock, organizationFindOneMock, collectionMock, getDbMock };
});

vi.mock("./mongodb", () => ({ getDb: mocks.getDbMock }));

import { getProjectPageData } from "./project-page-data";

describe("getProjectPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.projectFindOneMock.mockResolvedValue(null);
    mocks.organizationFindOneMock.mockResolvedValue(null);
  });

  it("returns static project data for MVP project ids", async () => {
    const detail = await getProjectPageData("project_food");

    expect(detail).toMatchObject({
      organizationSlug: "austin-mutual-aid",
      project: {
        id: "project_food",
        name: "Food Distribution",
      },
    });
    expect(detail?.roles.length).toBeGreaterThan(0);
    expect(detail?.shifts.length).toBeGreaterThan(0);
    expect(mocks.getDbMock).not.toHaveBeenCalled();
  });

  it("returns Mongo-backed project data without requiring an org query param", async () => {
    const projectId = "507f1f77bcf86cd799439011";
    const organizationId = "507f1f77bcf86cd799439022";

    mocks.projectFindOneMock.mockResolvedValue({
      _id: { toString: () => projectId },
      organizationId,
      name: "Neighborhood Pantry",
      description: "Weekly support",
      location: "Main campus",
      status: "active",
    });
    mocks.organizationFindOneMock.mockResolvedValue({
      _id: { toString: () => organizationId },
      slug: "lefthandalliance",
    });

    const detail = await getProjectPageData(projectId);

    expect(detail).toEqual({
      organizationSlug: "lefthandalliance",
      project: {
        id: projectId,
        organizationId,
        name: "Neighborhood Pantry",
        description: "Weekly support",
        location: "Main campus",
        status: "active",
      },
      roles: [],
      shifts: [],
    });
  });
});
