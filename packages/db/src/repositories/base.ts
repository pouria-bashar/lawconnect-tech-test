import { eq, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { Database } from "../client.js";

export abstract class BaseRepository<
  TTable extends PgTable,
  TSelect = TTable["$inferSelect"],
  TInsert = TTable["$inferInsert"],
> {
  constructor(
    protected readonly db: Database,
    protected readonly table: TTable,
  ) {}

  async findAll(): Promise<TSelect[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.db.select().from(this.table as any) as any;
  }

  async findById(id: string): Promise<TSelect | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pk = (this.table as any).id;
    const rows = await this.db
      .select()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(this.table as any)
      .where(eq(pk, id))
      .limit(1);
    return rows[0] as TSelect | undefined;
  }

  async findWhere(where: SQL): Promise<TSelect[]> {
    return this.db
      .select()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(this.table as any)
      .where(where) as any;
  }

  async create(data: TInsert): Promise<TSelect> {
    const rows = await this.db
      .insert(this.table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .values(data as any)
      .returning();
    return rows[0] as TSelect;
  }

  async createMany(data: TInsert[]): Promise<TSelect[]> {
    return this.db
      .insert(this.table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .values(data as any[])
      .returning() as unknown as Promise<TSelect[]>;
  }

  async update(id: string, data: Partial<TInsert>): Promise<TSelect> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pk = (this.table as any).id;
    const rows = await this.db
      .update(this.table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(data as any)
      .where(eq(pk, id))
      .returning();
    return rows[0] as TSelect;
  }

  async delete(id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pk = (this.table as any).id;
    await this.db.delete(this.table).where(eq(pk, id));
  }
}
