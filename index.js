const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const port = process.env.port || 5000;

//middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.er7kd0t.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyJWT = (req, res, next) => {
  console.log("hitting verify jwt");
  console.log(req.headers.authorization);
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "Unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  console.log("TOKEN INSSIDE VERIFY", token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(403)
        .send({ error: true, message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const galleryCollection = client.db("easyShop").collection("gallery");
    const productsCollection = client.db("easyShop").collection("allProducts");
    const myCollection = client.db("easyShop").collection("myProducts");
    //gallery data load
    app.get("/gallery", async (req, res) => {
      const query = galleryCollection.find();
      const result = await query.toArray();
      res.send(result);
    });

    //Products data load with searchTerm

    app.get("/products", async (req, res) => {
      const searchTerm = req.query.search;
      let cursor;
      if (searchTerm) {
        cursor = productsCollection.find({
          name: { $regex: searchTerm, $options: "i" },
        });
      } else {
        cursor = productsCollection.find().limit(6);
      }

      const result = await cursor.toArray();
      res.send(result);
    });

    //allProducts data load single data read
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          name: 1,
          price: 1,
          image: 1,
          seller: 1,
          category: 1,
          quantity: 1,
        },
      };
      const result = await productsCollection.findOne(query, options);
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { title: 1, price: 1, service_id: 1 },
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });

    //my products
    app.post("/myProducts", async (req, res) => {
      const products = req.body;
      // console.log(products);
      const result = await myCollection.insertOne(products);
      res.send(result);
    });

    // read data

    app.get("/myProducts", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await myCollection.find(query).toArray();
      res.send(result);
    });

    //update my products

    //update some data
    app.get("/myProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myCollection.findOne(query);
      res.send(result);
    });

    app.put("/myProducts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedProduct = req.body;
      const updateDoc = {
        $set: {
          title: updatedProduct.title,
          img: updatedProduct.img,
          price: updatedProduct.price,
          quantity: updatedProduct.quantity,
          des: updatedProduct.des,
          email: updatedProduct.email,
        },
      };

      const result = await myCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //delete
    app.delete("/myProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Easy Shop is Running");
});

app.listen(port, () => {
  console.log(`Easy Shop port is running on: ${port}`);
});
