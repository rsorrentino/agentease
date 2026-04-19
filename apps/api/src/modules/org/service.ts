import { OrgRepository } from './repository.js';
import { CreateOrgDTO, OrgRecord } from './types.js';

export class OrgService {
  constructor(private readonly repository: OrgRepository) {}

  async create(input: CreateOrgDTO): Promise<OrgRecord> {
    return this.repository.create(input);
  }

  async list(): Promise<OrgRecord[]> {
    return this.repository.list();
  }

  async getById(id: string): Promise<OrgRecord> {
    const org = await this.repository.findById(id);
    if (!org) throw new Error('Salesforce org not found');
    return org;
  }
}
