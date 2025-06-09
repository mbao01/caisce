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
            profileUrl: "http://localhost/google/profile-url",
          },
          {
            type: ProviderType.CREDENTIAL,
            providerId: "credential-id",
            emailVerified: false,
            expiresAt: null,
            profileUrl: "http://localhost/credential/profile-url",
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
