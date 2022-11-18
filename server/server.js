import fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// load from .env file
dotenv.config();

const app = fastify();
app.register(sensible);
app.register(cookie, { secret: process.env.COOKIE_SECRET });
app.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
});

const prisma = new PrismaClient();

// Middleware to set cookie to the userId of current user
app.addHook("onRequest", (req, res, done) => {
  if (req.cookies.userId !== CURRENT_USER_ID) {
    req.cookies.userId = CURRENT_USER_ID;
    res.clearCookie("userId");
    res.setCookie("userId", CURRENT_USER_ID);
  }
  done();
});

// Making believe blaine is logged in
const CURRENT_USER_ID = (
  await prisma.user.findFirst({
    where: { name: "Blaine" },
  })
).id;

const COMMENT_SELECT_FIELDS = {
  id: true,
  message: true,
  parentId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

app.get("/posts", async (req, res) => {
  return await commitToDB(
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
      },
    })
  );
});

app.get("/posts/:id", async (req, res) => {
  return await commitToDB(
    prisma.post.findUnique({
      where: { id: req.params.id },
      select: {
        body: true,
        title: true,
        comments: {
          orderBy: {
            createdAt: "desc",
          },
          select: COMMENT_SELECT_FIELDS,
        },
      },
    })
  );
});

app.post("/posts/:id/comments", async (req, res) => {
  if (req.body.message === "" || req.body.message == null) {
    return res.send(app.httpErrors.badRequest("Message is required"));
  }
  return await commitToDB(
    prisma.comment.create({
      data: {
        message: req.body.message,
        userId: req.cookies.userId,
        parentId: req.body.parentId,
        postId: req.params.id,
      },
      select: COMMENT_SELECT_FIELDS,
    })
  );
});

app.put("/posts/:postId/comments/:commentId", async (req, res) => {
  if (req.body.message === "" || req.body.message == null) {
    return res.send(app.httpErrors.badRequest("Message is required"));
  }

  const { userId } = await prisma.comment.findUnique({
    where: { id: req.params.commentId },
    select: { userId: true },
  });

  if (userId !== req.cookies.userId) {
    return res.send(
      app.httpErrors.unauthorized(
        "You do not have permission to edit this comment."
      )
    );
  }

  return await commitToDB(
    prisma.comment.update({
      where: { id: req.params.commentId },
      data: { message: req.body.message },
      select: { message: true },
    })
  );
});

// handle errors in prisma related code
async function commitToDB(promise) {
  const [error, data] = await app.to(promise);
  if (error) {
    return app.httpErrors.internalServerError(error.message);
  }
  return data;
}

app.listen({ port: process.env.PORT });
