export interface AuthUser {
  id: number;
  email: string;
  role: 'usuario' | 'administrador';
}
