export interface Package {
  id: string,
  siteId: string,
  schedule: string,
  approver: string,
  state: string,
  environment: string
  comment: string
}
