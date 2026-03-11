import { ilike, or } from "drizzle-orm";
import { lawyers, type Lawyer, type NewLawyer } from "../schema/lawyers.js";
import { BaseRepository } from "./base.js";
import type { Database } from "../client.js";

export class LawyerRepository extends BaseRepository<
  typeof lawyers,
  Lawyer,
  NewLawyer
> {
  constructor(db: Database) {
    super(db, lawyers);
  }

  async findBySpecialty(specialty: string): Promise<Lawyer[]> {
    return this.findWhere(ilike(lawyers.specialty, `%${specialty}%`));
  }

  async search(query: string): Promise<Lawyer[]> {
    const pattern = `%${query}%`;
    return this.findWhere(
      or(
        ilike(lawyers.name, pattern),
        ilike(lawyers.specialty, pattern),
        ilike(lawyers.location, pattern),
        ilike(lawyers.bio, pattern),
      )!,
    );
  }
}
