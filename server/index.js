require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "UnAuthorized Access" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "UnAuthorized Access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@programmershakib.sm4uc.mongodb.net/?retryWrites=true&w=majority&appName=programmershakib`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // database collection
    const usersCollection = client.db("DIPDB").collection("users");
    const allPostsCollection = client.db("DIPDB").collection("allPosts");
    const approvedPostsCollection = client
      .db("DIPDB")
      .collection("approvedPosts");

    // jwt
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    };

    // jwt create
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_KEY, {
        expiresIn: "10d",
      });
      res.cookie("token", token, cookieOptions).send({ success: true });
    });

    //  jwt remove
    app.post("/signOut", async (req, res) => {
      res
        .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ success: true });
    });

    // posts
    // news feed
    app.get("/news-feeds", async (req, res) => {
      const result = await approvedPostsCollection
        .find()
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    // my posts
    app.get("/my-posts/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const result = await allPostsCollection
        .find({ user_email: email })
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    // pending posts
    app.get("/pending-posts", async (req, res) => {
      const query = {
        approved_status: false,
        post_status: { $exists: false },
      };

      const result = await allPostsCollection.find(query).toArray();
      res.send(result);
    });

    // create post
    app.post("/new-post", verifyToken, async (req, res) => {
      const newPost = req.body;

      const result = await allPostsCollection.insertOne(newPost);
      res.send(result);
    });

    // approve post
    app.post("/approve-post/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      const post = await allPostsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!post) {
        return res.status(404).send({ message: "Post not found" });
      }

      const updatedPost = await allPostsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { approved_status: true } }
      );

      const result = await approvedPostsCollection.insertOne({
        ...post,
        approved_status: true,
      });
      res.send(result);
    });

    // reject post
    app.patch("/reject-post/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      const result = await allPostsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            post_status:
              "Your post could not be approved. Your post falls outside our guidelines. You can update the post if you wish. We will review your post again if you update it.",
          },
        }
      );
      res.send(result);
    });

    // like post
    app.post("/like-post/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const user_email = req.body.user_email;

      const post = await allPostsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!post) {
        return res.status(404).send({ message: "Post not found" });
      }

      const alreadyLiked = post.liked_by.includes(user_email);

      const updateQuery = alreadyLiked
        ? {
            $pull: { liked_by: user_email },
          }
        : {
            $push: { liked_by: user_email },
          };

      const [approvedUpdate, allUpdate] = await Promise.all([
        approvedPostsCollection.updateOne(
          { _id: new ObjectId(id) },
          updateQuery
        ),
        allPostsCollection.updateOne({ _id: new ObjectId(id) }, updateQuery),
      ]);

      res.send({ approvedUpdate, allUpdate });
    });

    // add comment
    app.post("/add-comment/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const { user_name, user_email, user_image, comment } = req.body;

      const newComment = {
        _id: new ObjectId(),
        user_name,
        user_email,
        user_image,
        comment,
        commented_at: new Date().toISOString(),
      };

      const approvedResult = await approvedPostsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: newComment } }
      );

      const allPostsResult = await allPostsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: newComment } }
      );

      res.send({ approvedResult, allPostsResult });
    });

    // delete comment
    app.delete(
      "/delete-comment/:postId/:commentId",
      verifyToken,
      async (req, res) => {
        const { postId, commentId } = req.params;

        const approvedResult = await approvedPostsCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $pull: { comments: { _id: new ObjectId(commentId) } } }
        );

        const allPostsResult = await allPostsCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $pull: { comments: { _id: new ObjectId(commentId) } } }
        );
        res.send({ approvedResult, allPostsResult });
      }
    );

    // my post delete
    app.delete("/my-post-delete/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await allPostsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      await pendingPostsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // user
    // get user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      if (!result) {
        return res.status(200).send(null);
      }
      res.send(result);
    });

    // add user
    app.post("/user", async (req, res) => {
      const userInfo = req.body;

      const result = await usersCollection.insertOne(userInfo);
      res.send(result);
    });

    // update lastSignInTime
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const updatedUser = {
        $set: {
          lastSignInTime: req.body.lastSignInTime,
        },
      };

      const result = await usersCollection.updateOne({ email }, updatedUser);
      res.send(result);
    });

    // check username
    app.get("/username/:username", async (req, res) => {
      const username = req.params.username;
      const result = await usersCollection.find({ username }).toArray();
      res.send(result);
    });

    // update username
    app.patch("/username/:email", async (req, res) => {
      const email = req.params.email;
      const username = req.body.username;

      const result = await usersCollection.updateOne(
        { email },
        { $set: { username } }
      );
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("dip is running");
});

app.listen(port, () => {
  console.log(`dip is running on port ${port}`);
});
