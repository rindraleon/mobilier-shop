import type { User } from "../types";

const daysAgo = (n: number): string => new Date(Date.now() - n * 86400000).toISOString();

export const initialUsers: User[] = [
  {
    id: "u-admin",
    name: "Alexandre Bernard",
    email: "admin@anti.fr",
    password: "admin123",
    role: "admin",
    createdAt: daysAgo(420),
    addresses: [
      {
        id: "a-admin-1",
        label: "Maison",
        isDefault: true,
        fullName: "Alexandre Bernard",
        phone: "01 23 45 67 89",
        address: "5 avenue de l'Atelier",
        address2: "",
        postalCode: "75010",
        city: "Paris",
        country: "France",
      },
    ],
  },
  {
    id: "u-client",
    name: "Camille Moreau",
    email: "client@anti.fr",
    password: "client123",
    role: "client",
    createdAt: daysAgo(210),
    addresses: [
      {
        id: "a-client-1",
        label: "Domicile",
        isDefault: true,
        fullName: "Camille Moreau",
        phone: "06 12 34 56 78",
        address: "12 rue des Lilas",
        address2: "Appartement 4B",
        postalCode: "75011",
        city: "Paris",
        country: "France",
      },
      {
        id: "a-client-2",
        label: "Bureau",
        isDefault: false,
        fullName: "Camille Moreau",
        phone: "06 12 34 56 78",
        address: "24 rue de la Fabrique",
        address2: "",
        postalCode: "69002",
        city: "Lyon",
        country: "France",
      },
    ],
  },
  { id: "u-3", name: "Jean Martin", email: "jean.martin@exemple.fr", password: "client123", role: "client", createdAt: daysAgo(180), addresses: [] },
  { id: "u-4", name: "Sophie Lambert", email: "sophie.lambert@exemple.fr", password: "client123", role: "client", createdAt: daysAgo(150), addresses: [] },
  { id: "u-5", name: "Lucas Petit", email: "lucas.petit@exemple.fr", password: "client123", role: "client", createdAt: daysAgo(110), addresses: [] },
  { id: "u-6", name: "Emma Rousseau", email: "emma.rousseau@exemple.fr", password: "client123", role: "client", createdAt: daysAgo(60), addresses: [] },
];
