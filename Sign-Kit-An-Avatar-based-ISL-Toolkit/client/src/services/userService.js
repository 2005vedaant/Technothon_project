// Mock user lookup service for Google sign‑in
// Returns true if the email is considered an existing user, false otherwise.
// TODO: Replace with real database/API call.
export const checkGoogleUser = async (email) => {
  const existingEmails = ['existing@example.com', 'testuser@domain.com'];
  await new Promise((resolve) => setTimeout(resolve, 200));
  return existingEmails.includes(email);
};
