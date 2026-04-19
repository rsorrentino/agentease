export interface OrgRecord {
  id: string;
  name: string;
  alias: string | null;
  username: string;
  instanceUrl: string;
}

export interface CreateOrgDTO {
  name: string;
  alias?: string;
  username: string;
  instanceUrl: string;
  encryptedAccessToken: string;
  encryptedRefreshToken: string;
}
