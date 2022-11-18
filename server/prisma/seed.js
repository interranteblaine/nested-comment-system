import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seed() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  const blaine = await prisma.user.create({ data: { name: "Blaine" } });
  const justine = await prisma.user.create({ data: { name: "Justine" } });

  const post1 = await prisma.post.create({
    data: {
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget sit amet tellus cras adipiscing enim eu turpis egestas. Volutpat diam ut venenatis tellus in. Tempor nec feugiat nisl pretium fusce id velit ut tortor. Non consectetur a erat nam at lectus urna duis. Magna eget est lorem ipsum dolor sit. Et malesuada fames ac turpis egestas integer. Risus feugiat in ante metus dictum at tempor. Amet massa vitae tortor condimentum lacinia quis vel eros donec. Et ultrices neque ornare aenean euismod elementum. Vulputate dignissim suspendisse in est. Posuere morbi leo urna molestie at elementum eu.",
      title: "Post 1",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Arcu cursus euismod quis viverra nibh cras pulvinar. Purus ut faucibus pulvinar elementum integer enim neque volutpat ac. Aliquam purus sit amet luctus venenatis. Donec massa sapien faucibus et molestie ac feugiat sed.",
      title: "Post 2",
    },
  });

  const comment1 = await prisma.comment.create({
    data: {
      message: "I am a root comment",
      userId: justine.id,
      postId: post1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      parentId: comment1.id,
      message: "I am a nested comment",
      userId: blaine.id,
      postId: post1.id,
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      message: "I am another root comment",
      userId: blaine.id,
      postId: post1.id,
    },
  });
}

seed();
