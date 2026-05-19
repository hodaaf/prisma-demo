import { faker } from "@faker-js/faker";

import { prisma } from "./lib/prisma";

async function main() {
  console.log("Starting seed...");

  // Clean up existing data
  console.log("Cleaning existing data...");
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.rating.deleteMany();
  console.log("Finished cleaning existing data.");

  // Create Ratings with fixed values
  console.log("Creating ratings...");
  const rawRatingsData = [
    { value: 1, label: "Bad" },
    { value: 2, label: "Fair" },
    { value: 3, label: "Good" },
    { value: 4, label: "Very Good" },
    { value: 5, label: "Excellent" },
  ];

  const ratings = [];
  for (const rating of rawRatingsData) {
    const createdRating = await prisma.rating.create({
      data: rating,
    });
    ratings.push(createdRating);
  }
  console.log(`Created ${ratings.length} ratings.`);

  // Create Genres
  console.log("Creating genres...");
  const rawGenresData = [
    { name: "Fiction" },
    { name: "Fantasy" },
    { name: "Science Fiction" },
    { name: "Mystery" },
    { name: "Romance" },
    { name: "Thriller" },
    { name: "Historical" },
    { name: "Non-Fiction" },
  ];

  const genres = [];
  for (const genre of rawGenresData) {
    const createdGenre = await prisma.genre.create({
      data: genre,
    });
    genres.push(createdGenre);
  }
  console.log(`Created ${genres.length} genres.`);

  // Create authors
  console.log("Creating authors...");
  const authors = [];
  for (let i = 0; i < 5; i++) {
    const createdAuthor = await prisma.author.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    });

    authors.push(createdAuthor);
  }
  console.log(`Created ${authors.length} authors.`);

  // Create publishers
  console.log("Creating publishers...");
  const publishers = [];
  for (let i = 0; i < 5; i++) {
    const createdPublisher = await prisma.publisher.create({
      data: {
        name: faker.company.name(),
      },
    });
    publishers.push(createdPublisher);
  }
  console.log(`Created ${publishers.length} publishers.`);

  // Create users
  console.log("Creating users...");
  const users = [];
  for (let i = 0; i < 5; i++) {
    const createdUser = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    });
    users.push(createdUser);
  }
  console.log(`Created ${users.length} users.`);

  // Create books
  console.log("Creating books...");
  const books = [];

  for (let i = 0; i < 10; i++) {
    const selectedGenres = faker.helpers.arrayElements(
      genres,
      faker.number.int({ min: 1, max: 3 })
    );

    const selectedAuthor = faker.datatype.boolean()
      ? faker.helpers.arrayElement(authors)
      : null;

    const selectedPublisher = faker.datatype.boolean()
      ? faker.helpers.arrayElement(publishers)
      : null;

    const createdBook = await prisma.book.create({
      data: {
        title: faker.book.title(),
        ...(selectedAuthor && {
          author: {
            connect: { id: selectedAuthor.id },
          },
        }),
        ...(selectedPublisher && {
          publisher: {
            connect: { id: selectedPublisher.id },
          },
        }),
        genres: {
          connect: selectedGenres.map((genre) => ({ id: genre.id })),
        },
      },
      include: {
        genres: true,
        author: true,
        publisher: true,
      },
    });

    books.push(createdBook);
  }

  console.log(`Created ${books.length} books.`);

  // Create reviews
  console.log("Creating reviews...");
  const reviews = [];

  for (let i = 0; i < 20; i++) {
    const selectedBook = faker.helpers.arrayElement(books);
    const selectedRating = faker.helpers.arrayElement(ratings);
    const selectedUser = faker.datatype.boolean()
      ? faker.helpers.arrayElement(users)
      : null;

    const createdReview = await prisma.review.create({
      data: {
        comment: faker.lorem.sentences({ min: 1, max: 3 }),
        book: {
          connect: { id: selectedBook.id },
        },
        rating: {
          connect: { id: selectedRating.id },
        },
        ...(selectedUser && {
          user: {
            connect: { id: selectedUser.id },
          },
        }),
      },
      include: {
        book: true,
        rating: true,
        user: true,
      },
    });

    reviews.push(createdReview);
  }

  console.log(`Created ${reviews.length} reviews.`);
}

main() 
  .then(async () => {
    console.log("Disconnecting Prisma...");
    await prisma.$disconnect();
    console.log("Seed finished successfully.");
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });