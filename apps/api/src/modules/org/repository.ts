import { PrismaClient } from '@prisma/client';
import { CreateOrgDTO, OrgRecord } from './types.js';

export interface OrgRepository {
  create(input: CreateOrgDTO): Promise<OrgRecord>;
  list(): Promise<OrgRecord[]>;
  findById(id: string): Promise<OrgRecord | null>;
}

export class PrismaOrgRepository implements OrgRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreateOrgDTO): Promise<OrgRecord> {
    return this.db.salesforceOrg.create({
      data: input
    });
  }

  async list(): Promise<OrgRecord[]> {
    return this.db.salesforceOrg.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string): Promise<OrgRecord | null> {
    return this.db.salesforceOrg.findUnique({ where: { id } });
  }
}
