export type Pet = {
  id: number;
  name: string | null;
  breed: string;
  color: string;
  size: string;
  sex: string;
  characteristics: string | null;
  photoUrl: string | null;
};

export type ReportUser = { id: number; name: string; phone: string };

export type Report = {
  id: number;
  type: "perdida" | "encontrada";
  eventDate: string;
  location: string;
  description: string;
  status: "activo" | "resuelto";
  createdAt: string;
  pet: Pet;
  user?: ReportUser;
};