export const CONTACT_LINKS = {
  twitter: "https://x.com/YashSh0031",
  linkedin: "https://www.linkedin.com/in/yashsharma31/",
  github: "https://github.com/yashsharma31",
};

export const EMAIL = "yash.sh0031@gmail.com";

/**
 * GitHub accounts wired via local SSH (personal + work).
 * Proof bar merges contribution calendars from both.
 */
export const GITHUB_ACCOUNTS = {
  personal: "yashsharma31",
  work: "yashsharma1133",
} as const;

export const GITHUB_CONTRIBUTION_USERS = [
  GITHUB_ACCOUNTS.personal,
  GITHUB_ACCOUNTS.work,
] as const;
