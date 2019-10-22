export interface Package {
  id: string,
  siteId: string,
  schedule: string,
  approver: string,
  state: string,
  environment: string
  comment: string
}

export interface CurrentFilters {
  environment: string;
  path: string;
  state: string
  limit: number,
  page: number
}
