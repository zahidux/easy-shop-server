const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const galleryCollection = client.db("easyShop").collection("gallery");
    const productsCollection = client.db("easyShop").collection("bestProducts");

    //gallery data load
    app.get("/gallery", async (req, res) => {
      const query = galleryCollection.find();
      const result = await query.toArray();
      res.send(result);
    });

    //bestProducts data load

    app.get("/products", async (req, res) => {
      const query = productsCollection.find();
      const result = await query.toArray();
      res.send(result);
    });

    //bestProducts data load single data read
    app.get("/productsDetails/:id", async (req, res) => {
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
