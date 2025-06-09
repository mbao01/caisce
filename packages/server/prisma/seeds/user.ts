import { PrismaClient, ProviderType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@email.com",
      providers: {
        create: [
          {
            type: ProviderType.GOOGLE,
            providerId: "google-id",
            emailVerified: true,
            expiresAt: new Date(Date.now() + 3600 * 1000),
          },
          {
            type: ProviderType.CREDENTIAL,
            providerId: "credential-id",
            emailVerified: false,
            expiresAt: null,
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
