import { authenticateUser } from "@/lib/auth";

describe("auth module", () => {
  it("authenticates dirigente credentials", () => {
    const result = authenticateUser("dirigente", "Dirigente123*");
    expect(result?.role).toBe("dirigente");
  });

  it("authenticates musico credentials", () => {
    const result = authenticateUser("musico", "Musico123*");
    expect(result?.role).toBe("musico");
  });

  it("returns null for invalid password", () => {
    const result = authenticateUser("musico", "wrong");
    expect(result).toBeNull();
  });
});
