export const USER_FIELDS = `
  Id,
  Name,
  Username,
  UserRole.Name,
  IsActive,
  FX5__Mobile_Version__c,
  TimeZoneSidKey,
  LocaleSidKey,
  FullPhotoUrl,
  ContactId,
  Profile.Id,
  Profile.Name,
  Profile.UserLicense.Name,
  Profile.PermissionsModifyAllData
`;
export const CONTACT_FIELDS = `
  Id,
  Name,
  Account.Name,
  FX5__Office__r.Name
`;
export const ORG_FIELDS = `
  Id,
  Name,
  OrganizationType
`;
