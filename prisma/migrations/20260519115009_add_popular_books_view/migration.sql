-- This is a manual migration to add a view for popular books based on average ratings and review counts.

DROP VIEW IF EXISTS "popular_books";

CREATE VIEW "popular_books" AS
SELECT
  b."id" AS book_id,
  b."title" AS book_title,
  a."name" AS author_name,
  p."name" AS publisher_name,
  AVG(rat."value")::float AS average_rating,
  COUNT(rv."id")::int AS review_count
FROM "Book" b
JOIN "Review" rv ON rv."bookId" = b."id"
JOIN "Rating" rat ON rat."id" = rv."ratingId"
LEFT JOIN "Author" a ON a."id" = b."authorId"
LEFT JOIN "Publisher" p ON p."id" = b."publisherId"
GROUP BY
  b."id",
  b."title",
  a."name",
  p."name"
HAVING AVG(rat."value") > 4;