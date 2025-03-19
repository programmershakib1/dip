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
      const posts = await approvedPostsCollection
        .find()
        .sort({ _id: -1 })
        .toArray();

      const postsWithUserData = await Promise.all(
        posts.map(async (post) => {
          const user_data = await usersCollection.findOne({
            _id: new ObjectId(post.user_id),
          });

          return {
            ...post,
            user_data: user_data,
          };
        })
      );

      res.send(postsWithUserData);
    });

    // my data
    app.get("/my-data/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const user_data = await usersCollection.findOne({ email });
      const user_id = user_data._id;
      const posts = await allPostsCollection
        .find({ user_id: user_id.toString() })
        .sort({ _id: -1 })
        .toArray();
      res.send({ user_data, posts });
    });

    // create post
    app.post("/new-post", verifyToken, async (req, res) => {
      const newPost = req.body;

      const result = await allPostsCollection.insertOne(newPost);
      res.send(result);
    });

    // get pending posts
    app.get("/pending-posts", verifyToken, async (req, res) => {
      const query = {
        approved_status: false,
        post_status: { $exists: false },
      };

      const posts = await allPostsCollection.find(query).toArray();

      const postsWithUserData = await Promise.all(
        posts.map(async (post) => {
          const user_data = await usersCollection.findOne({
            _id: new ObjectId(post.user_id),
          });

          return {
            ...post,
            user_data: user_data,
          };
        })
      );

      res.send(postsWithUserData);
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

      await allPostsCollection.updateOne(
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

      const approvedUpdate = approvedPostsCollection.updateOne(
        { _id: new ObjectId(id) },
        updateQuery
      );

      const allUpdate = await allPostsCollection.updateOne(
        { _id: new ObjectId(id) },
        updateQuery
      );

      res.send({ approvedUpdate, allUpdate });
    });

    // add comment
    app.post("/add-comment/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const { user_id, comment } = req.body;

      const newComment = {
        _id: new ObjectId(),
        user_id,
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
      "/delete-comment/:post_id/:comment_id",
      verifyToken,
      async (req, res) => {
        const { post_id, comment_id } = req.params;

        const approvedResult = await approvedPostsCollection.updateOne(
          { _id: new ObjectId(post_id) },
          { $pull: { comments: { _id: new ObjectId(comment_id) } } }
        );

        const allPostsResult = await allPostsCollection.updateOne(
          { _id: new ObjectId(post_id) },
          { $pull: { comments: { _id: new ObjectId(comment_id) } } }
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
      res.send(result);
    });

    // send friend request
    app.put("/send-friend-request/:target_id", async (req, res) => {
      const target_id = req.params.target_id;
      const current_id = req.body.current_id;

      if (!ObjectId.isValid(target_id) || !ObjectId.isValid(current_id)) {
        return res
          .status(400)
          .send({ success: false, error: "Invalid user ID" });
      }

      try {
        const targetUser = await usersCollection.findOne({
          _id: new ObjectId(target_id),
        });
        if (!targetUser) {
          return res
            .status(404)
            .send({ success: false, error: "Target user not found" });
        }
        if (
          targetUser.friends?.includes(current_id) ||
          targetUser.pendingRequests?.includes(current_id)
        ) {
          return res
            .status(400)
            .send({ success: false, error: "Already friends or request sent" });
        }

        const updateTarget = await usersCollection.updateOne(
          { _id: new ObjectId(target_id) },
          { $addToSet: { pendingRequests: current_id } }
        );

        const updateSender = await usersCollection.updateOne(
          { _id: new ObjectId(current_id) },
          { $addToSet: { sentRequests: target_id } }
        );

        if (updateTarget.modifiedCount > 0 && updateSender.modifiedCount > 0) {
          res.send({
            success: true,
            message: "Friend request sent successfully",
          });
        } else {
          res
            .status(500)
            .send({ success: false, error: "Failed to send friend request" });
        }
      } catch (error) {
        res.status(500).send({ success: false, error: error.message });
      }
    });

    // accept friend request
    app.put("/accept-friend-request/:target_id", async (req, res) => {
      const target_id = req.params.target_id;
      const current_id = req.body.current_id;

      if (!ObjectId.isValid(target_id) || !ObjectId.isValid(current_id)) {
        return res
          .status(400)
          .send({ success: false, error: "Invalid user ID" });
      }

      try {
        const current = await usersCollection.findOne({
          _id: new ObjectId(current_id),
        });
        if (!current) {
          return res
            .status(404)
            .send({ success: false, error: "Receiver not found" });
        }
        if (!current.pendingRequests?.includes(target_id)) {
          return res.status(400).send({
            success: false,
            error: "No pending request from this user",
          });
        }

        const target = await usersCollection.findOne({
          _id: new ObjectId(target_id),
        });

        if (!target) {
          return res
            .status(404)
            .send({ success: false, error: "Sender not found" });
        }

        await usersCollection.updateOne(
          { _id: new ObjectId(current_id) },
          {
            $addToSet: { friends: target_id },
            $pull: { pendingRequests: target_id },
          }
        );

        await usersCollection.updateOne(
          { _id: new ObjectId(target_id) },
          {
            $addToSet: { friends: current_id },
            $pull: { sentRequests: current_id },
          }
        );

        res.send({ success: true });
      } catch (error) {
        res.status(500).send({ success: false, error: error.message });
      }
    });

    // cancel friend request
    app.put("/cancel-friend-request/:target_id", async (req, res) => {
      const target_id = req.params.target_id;
      const current_id = req.body.current_id;

      if (!ObjectId.isValid(target_id) || !ObjectId.isValid(current_id)) {
        return res
          .status(400)
          .send({ success: false, error: "Invalid user ID" });
      }

      try {
        const sender = await usersCollection.findOne({
          _id: new ObjectId(current_id),
        });
        if (!sender || !sender.sentRequests?.includes(target_id)) {
          return res
            .status(400)
            .send({ success: false, error: "No sent request to this user" });
        }

        const updateSender = await usersCollection.updateOne(
          { _id: new ObjectId(current_id) },
          { $pull: { sentRequests: target_id } }
        );

        const updateReceiver = await usersCollection.updateOne(
          { _id: new ObjectId(target_id) },
          { $pull: { pendingRequests: current_id } }
        );

        if (
          updateSender.modifiedCount > 0 &&
          updateReceiver.modifiedCount > 0
        ) {
          res.send({
            success: true,
            message: "Friend request cancelled successfully",
          });
        } else {
          res
            .status(500)
            .send({ success: false, error: "Failed to cancel friend request" });
        }
      } catch (error) {
        res.status(500).send({ success: false, error: error.message });
      }
    });

    // reject friend request
    app.put("/reject-friend-request/:target_id", async (req, res) => {
      const target_id = req.params.target_id;
      const current_id = req.body.current_id;

      if (!ObjectId.isValid(target_id) || !ObjectId.isValid(current_id)) {
        return res
          .status(400)
          .send({ success: false, error: "Invalid user ID" });
      }

      try {
        const receiver = await usersCollection.findOne({
          _id: new ObjectId(current_id),
        });
        if (!receiver || !receiver.pendingRequests?.includes(target_id)) {
          return res.status(400).send({
            success: false,
            error: "No pending request from this user",
          });
        }

        const updateReceiver = await usersCollection.updateOne(
          { _id: new ObjectId(current_id) },
          { $pull: { pendingRequests: target_id } }
        );

        if (updateReceiver.modifiedCount > 0) {
          res.send({
            success: true,
            message: "Friend request rejected successfully",
          });
        } else {
          res
            .status(500)
            .send({ success: false, error: "Failed to reject friend request" });
        }
      } catch (error) {
        res.status(500).send({ success: false, error: error.message });
      }
    });

    // follow
    app.put("/follow/:target_id", async (req, res) => {
      const target_id = req.params.target_id;
      const current_id = req.body.current_id;

      try {
        const updateFollowing = await usersCollection.updateOne(
          { _id: new ObjectId(current_id) },
          { $addToSet: { following: target_id } }
        );

        const updateFollowers = await usersCollection.updateOne(
          { _id: new ObjectId(target_id) },
          { $addToSet: { followers: current_id } }
        );

        res.send({ success: true });
      } catch (error) {
        res.status(500).send({ success: false, error: error.message });
      }
    });

    // unfollow
    app.put("/unfollow/:target_id", async (req, res) => {
      const target_id = req.params.target_id;
      const current_id = req.body.current_id;

      try {
        const updateFollowing = await usersCollection.updateOne(
          { _id: new ObjectId(current_id) },
          { $pull: { following: target_id } }
        );

        const updateFollowers = await usersCollection.updateOne(
          { _id: new ObjectId(target_id) },
          { $pull: { followers: current_id } }
        );

        res.send({
          success: true,
          following: updateFollowing,
          followers: updateFollowers,
        });
      } catch (error) {
        res.status(500).send({ success: false, error: error.message });
      }
    });

    // user
    // get user in email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      if (!result) {
        return res.status(200).send(null);
      }
      res.send(result);
    });

    // get user in username
    app.get("/username/:username", async (req, res) => {
      const username = req.params.username;
      const result = await usersCollection.findOne({ username });
      if (!result) {
        return res.status(200).send(null);
      }
      res.send(result);
    });

    // get user in user id
    app.get("/user_id/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (!result) {
        return res.status(200).send(null);
      }
      res.send(result);
    });

    // get user in many user id
    app.post("/users-by-ids", async (req, res) => {
      const { userIds } = req.body;
      try {
        const users = await usersCollection
          .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
          .toArray();
        res.send(users);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // add user
    app.post("/user", async (req, res) => {
      const userInfo = req.body;
      const result = await usersCollection.insertOne(userInfo);
      res.send(result);
    });

    // check username
    app.get("/user_name/:username", async (req, res) => {
      const username = req.params.username;
      const user = await usersCollection.findOne({ username });
      if (user) {
        res.json({ available: false });
      } else {
        res.json({ available: true });
      }
    });

    // get user username
    // app.get("/username/:username", async (req, res) => {
    //   const username = req.params.username;
    //   const result = await usersCollection.findOne({ username });
    //   if (!result) {
    //     return res.status(200).send(null);
    //   }
    //   res.send(result);
    // });

    // update lastSignInTime
    // app.put("/user/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const updatedUser = {
    //     $set: {
    //       lastSignInTime: req.body.lastSignInTime,
    //     },
    //   };

    //   const result = await usersCollection.updateOne({ email }, updatedUser);
    //   res.send(result);
    // });

    // update username
    // app.patch("/username/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const username = req.body.username;

    //   const result = await usersCollection.updateOne(
    //     { email },
    //     { $set: { username } }
    //   );
    //   res.send(result);
    // });
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
