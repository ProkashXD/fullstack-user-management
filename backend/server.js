require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.log("MongoDB error:", err);
  });

  // CREATE
app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json(user);
  }catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered."
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", ")
      });
    }

    res.status(500).json({
      message: "Something went wrong."
    });
  }
});


// READ
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    res.render("users", { users });
  }catch (error) {
    console.log("READ ERROR:", error);
    res.status(500).send(error.message);
  }
});

app.get("/users/:id/edit", async (req, res) =>{
  try{
    console.log("ID received:", req.params.id);

    const user = await User.findById(req.params.id);

    console.log("User found:", user);

    if(!user) {
      return res.status(404).send("User not found");
    }

    res.render("edit-user", { user });

  } catch (error) {
    console.log("EDIT ERROR:", error);
    res.status(500).send("Server error");
  }
});

app.post("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.redirect("/users"); 
  } catch(error) {
    console.log(error);
    res.status(400).send("Update failed");
  }
});
  app.post("/users/:id/delete", async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);

      res.redirect("/users");
    } catch (error) {
      console.log("DELETE ERROR:", error);
      res.status(400).send("Delete failed");
    }
  });
  
app.get("/api/users", async(req, res) => {
  try{
    const users = await User.find();
    res.json(users);
  }
  catch(error){
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});
  
app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, 
        runValidators: true,
      }
    );

    if(!user){
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  }
  catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered."
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", ")
      });
    }

    res.status(500).json({
      message: "Something went wrong."
    });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete user" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



