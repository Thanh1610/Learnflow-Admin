export type User = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
  phone: string | null;
  provider: string | null;
  gender: '1' | '2' | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  googleId: string | null;
  githubId: string | null;
  dateOfBirth: string | null;
};
