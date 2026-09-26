import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ShelfShare...");

  // --- Tags ---
  const tagNames = [
    "Sci-Fi", "Fantasy", "Thriller", "Romance", "Slow Burn",
    "Mystery", "Coming of Age", "Dystopian", "Horror", "Comedy",
    "Historical", "Space Opera", "Character-Driven", "Twisty",
  ];
  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tags[name] = tag.id;
  }

  // --- Items ---
  const items = [
    { title: "Dune", type: "BOOK", description: "A desert planet, a prophecy, and a very large worm.", tags: ["Sci-Fi", "Space Opera", "Character-Driven"] },
    { title: "The Fifth Season", type: "BOOK", description: "A broken world, three timelines, one devastating twist.", tags: ["Fantasy", "Dystopian", "Twisty"] },
    { title: "Gone Girl", type: "BOOK", description: "A marriage unravels in the most unreliable way possible.", tags: ["Thriller", "Twisty", "Mystery"] },
    { title: "Pride and Prejudice", type: "BOOK", description: "Wit, pride, and a very slow-burning romance.", tags: ["Romance", "Slow Burn", "Historical"] },
    { title: "The Martian", type: "BOOK", description: "One astronaut, one planet, a lot of problem-solving.", tags: ["Sci-Fi", "Comedy", "Character-Driven"] },
    { title: "Mexican Gothic", type: "BOOK", description: "A crumbling house keeps a very unsettling secret.", tags: ["Horror", "Mystery", "Historical"] },
    { title: "Normal People", type: "BOOK", description: "Two people, on and off, for years.", tags: ["Romance", "Slow Burn", "Coming of Age"] },
    { title: "Project Hail Mary", type: "BOOK", description: "Amnesia, deep space, and an unlikely friendship.", tags: ["Sci-Fi", "Comedy", "Space Opera"] },
    { title: "Severance", type: "SHOW", description: "Work self, home self, never the twain shall meet.", tags: ["Sci-Fi", "Mystery", "Twisty"] },
    { title: "The Bear", type: "SHOW", description: "A chaotic kitchen and the people trying to survive it.", tags: ["Comedy", "Character-Driven"] },
    { title: "Succession", type: "SHOW", description: "A family, a fortune, and nobody who deserves either.", tags: ["Thriller", "Character-Driven", "Twisty"] },
    { title: "Fleabag", type: "SHOW", description: "One woman, breaking the fourth wall and her own heart.", tags: ["Comedy", "Romance", "Character-Driven"] },
    { title: "Stranger Things", type: "SHOW", description: "Small town, big monster, bigger bikes.", tags: ["Sci-Fi", "Horror", "Coming of Age"] },
    { title: "The Expanse", type: "SHOW", description: "Solar-system politics with real physics.", tags: ["Sci-Fi", "Space Opera", "Thriller"] },
    { title: "Broadchurch", type: "SHOW", description: "A small coastal town, one death, everyone a suspect.", tags: ["Mystery", "Thriller", "Twisty"] },
    { title: "Derry Girls", type: "SHOW", description: "Teenage chaos against a backdrop bigger than any of them realize.", tags: ["Comedy", "Coming of Age", "Historical"] },
    { title: "Klara and the Sun", type: "BOOK", description: "An artificial friend watches the world with quiet devotion.", tags: ["Sci-Fi", "Character-Driven", "Slow Burn"] },
    { title: "The Silent Patient", type: "BOOK", description: "A woman stops speaking the day of a murder.", tags: ["Thriller", "Mystery", "Twisty"] },
  ];

  const createdItems: Record<string, string> = {};
  for (const it of items) {
    const item = await prisma.item.create({
      data: {
        title: it.title,
        type: it.type as any,
        description: it.description,
        coverSeed: it.title,
        tags: {
          create: it.tags.map((t) => ({ tag: { connect: { id: tags[t] } } })),
        },
      },
    });
    createdItems[it.title] = item.id;
  }

  // --- Users ---
  const passwordHash = await bcrypt.hash("password123", 10);
  const users = [
    { name: "Amara Osei", username: "amara", email: "amara@example.com" },
    { name: "Jonah Reyes", username: "jonah", email: "jonah@example.com" },
    { name: "Priya Nair", username: "priya", email: "priya@example.com" },
  ];

  const createdUsers: Record<string, string> = {};
  for (const u of users) {
    const user = await prisma.user.create({
      data: { ...u, passwordHash },
    });
    createdUsers[u.username] = user.id;
  }

  // --- Sample lists / ratings (this is what powers recommendations) ---
  const sampleUserItems = [
    // Amara likes Sci-Fi / Space Opera heavily
    { user: "amara", item: "Dune", status: "DONE", rating: 5 },
    { user: "amara", item: "Project Hail Mary", status: "DONE", rating: 5 },
    { user: "amara", item: "The Martian", status: "DONE", rating: 4 },
    { user: "amara", item: "Severance", status: "IN_PROGRESS", rating: null },
    { user: "amara", item: "Broadchurch", status: "WANT", rating: null },

    // Jonah likes Thriller / Twisty
    { user: "jonah", item: "Gone Girl", status: "DONE", rating: 5 },
    { user: "jonah", item: "The Silent Patient", status: "DONE", rating: 5 },
    { user: "jonah", item: "Succession", status: "DONE", rating: 4 },
    { user: "jonah", item: "Mexican Gothic", status: "WANT", rating: null },

    // Priya likes Romance / Slow Burn / Character-Driven
    { user: "priya", item: "Normal People", status: "DONE", rating: 5 },
    { user: "priya", item: "Pride and Prejudice", status: "DONE", rating: 4 },
    { user: "priya", item: "Fleabag", status: "DONE", rating: 5 },
    { user: "priya", item: "Klara and the Sun", status: "IN_PROGRESS", rating: null },
  ];

  for (const ui of sampleUserItems) {
    await prisma.userItem.create({
      data: {
        userId: createdUsers[ui.user],
        itemId: createdItems[ui.item],
        status: ui.status as any,
        rating: ui.rating,
      },
    });
  }

  console.log("Seed complete. Sample login: amara@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
