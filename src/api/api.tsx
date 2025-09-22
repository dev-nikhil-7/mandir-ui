// api.ts

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const roles = ["Admin", "User", "Editor", "Manager"];

function generateUsers(count: number = 1000): User[] {
  const users: User[] = [];
  for (let i = 1; i <= count; i++) {
    users.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
    });
  }
  return users;
}

// Create mock DB
const mockUsers = generateUsers(1000);

// Mimic an async API
export const getUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockUsers), 300); // simulate network delay
  });
};
