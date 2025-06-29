const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {ObjectId} = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;
//coffe-store-server
//oV6ZQiQry1u5r9pq
app.use(cors());
app.use(express.json());

const {MongoClient, ServerApiVersion} = require("mongodb");
//const uri = "mongodb+srv://coffe-store-server:oV6ZQiQry1u5r9pq@cluster0.ayqadbk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ayqadbk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const db = client.db("coffeeDB"); // replace with your actual DB name
    const coffeesCollection = db.collection("coffees");
    const usersCollection = client.db("coffee").collection("users"); // replace with your actual DB name

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ping: 1});
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.get("/coffees", async (req, res) => {
      const result = await coffeesCollection.find().toArray();
     
      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
    
      const result = await coffeesCollection.insertOne(newCoffee);
      res.send(result);
    });
    app.delete("/coffees/:id", async (req, res) => {
      const id = new ObjectId(req.params.id);

      const query = {_id: new ObjectId(id)};
      const result = await coffeesCollection.deleteOne(query);
      res.send(result);
    });
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedCoffee = req.body;
      // const updatedDoc = {
      //     $set: updatedCoffee
      // }

      const updatedDoc = {
        $set: {
          name: updatedCoffee.name,
          supplier: updatedCoffee.supplier,
        },
      };

      const result = await coffeesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const coffee = await coffeesCollection.findOne(query);
      res.send(coffee);
    });

    app.post("/users", async (req, res) => {
      const userProfile = req.body;
     
      const result = await usersCollection.insertOne(userProfile);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
      
    });
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const coffee = await usersCollection.findOne(query);
      res.send(coffee);
    });
    app.delete("/users/:id", async (req, res) => {
      const id = new ObjectId(req.params.id);
     console.log(id)
      const query = {_id: new ObjectId(id)};
      const result = await usersCollection.deleteOne(query);
      console.log(result)
      res.send(result);
    });

    app.patch('/users', async(req, res) =>{
            const {email, lastSignInTime} = req.body;
            const filter = {email: email}
            const updatedDoc = {
                $set: {
                    lastSignInTime: lastSignInTime
                }
            }

            const result = await usersCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffee server is getting hotter.");
});

app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
});
