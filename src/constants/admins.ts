export const ADMIN_EMAILS: readonly string[] = [
  'nabiulislam609@gmail.com',
  'aicourse.nabin@gmail.com',
];

export const isAuthorizedAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};
