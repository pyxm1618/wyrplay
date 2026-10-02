import type { AccountProfile } from "./account-chrome";
export function accountProfile(user: {
  name: string;
  email: string;
  image?: string | null | undefined;
  createdAt: Date | string;
}): AccountProfile {
  return {
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    joined: new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(user.createdAt)),
  };
}
