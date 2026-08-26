const request = require("supertest");
const app = require("../src/app.js");

// Mock the DB pool — controllers call pool.query(...) against this
jest.mock("../src/db.js", () => ({
  query: jest.fn(),
}));
const pool = require("../src/db.js");

// Mock the auth middleware — bypasses real JWT verification
jest.mock("../src/middleware/auth.js", () => (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "Unauthorized!" });
  }
  req.userId = "test-user-id";
  next();
});

describe("DELETE /api/list/:id/collaborators/:shareId", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    const res = await request(app).delete("/api/list/1/collaborators/2");
    expect(res.status).toBe(401);
  });

  it("returns 403 if requester is not the owner", async () => {
    // getAccessLevel: ownerCheck → no match, collabCheck → 'editor'
    pool.query.mockResolvedValueOnce({ rows: [] });
    pool.query.mockResolvedValueOnce({ rows: [{ role: "editor" }] });

    const res = await request(app)
      .delete("/api/list/1/collaborators/2")
      .set("Authorization", "Bearer faketoken");

    expect(res.status).toBe(403);
  });

  it("deletes the share when requester is owner", async () => {
    // getAccessLevel: ownerCheck → match → 'owner'
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    // DELETE query result
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });

    const res = await request(app)
      .delete("/api/list/1/collaborators/2")
      .set("Authorization", "Bearer faketoken");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("List removed.");
  });
});
