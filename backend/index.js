import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import pool from "./db.js"; // Ensure this is the correct path

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors()); // Allows frontend to communicate with this backend
app.use(express.json()); // Parses JSON requests

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// **Test database connection**
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ message: "Database connected!", result: rows[0].result });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// **Chat API Route**
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    let responseText = "I didn't understand that.";

    if (message.toLowerCase().includes("database status")) {
        // Check if the database is reachable
        const [dbCheck] = await pool.query("SELECT NOW() AS current_time");
        responseText = `Database is running. Current server time: ${dbCheck[0].current_time}`;
    } else if (message.toLowerCase().includes("latest entry")) {
        // Fetch the latest entry from a generic data table
        const [latestEntry] = await pool.query ("SELECT * FROM customers ORDER BY id DESC LIMIT 1"); 
        responseText = latestEntry.length > 0 
            ? `Latest entry: ${JSON.stringify(latestEntry[0])}` 
            : "No data entries found.";
    } else if (message.toLowerCase().includes("table count")) {
        // Get the number of rows in a specific table
        const [rowCount] = await pool.query("SELECT COUNT(*) AS total FROM data_table");
        responseText = `Total entries in data_table: ${rowCount[0].total}`;
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error("Error handling chat request:", error);
    res.status(500).json({ error: "Something went wrong" });
  }


  
}); 

//Get all customers 
app.get("/api/customers", async (req,res)=> { 
  try { 
    const customers = await pool.query("SELECT * FROM customers LIMIT 100");  
    res.json({customers}); 
  } catch (error) { 
    console.error("Error fetching customers:", error); 
    res.status(500).json({ error: "Error fetching customers" });
  }
}); 

// Get customer by ID
app.get("/api/customers/:id", async (req, res) => {
  try {
    const [customer] = await pool.query(
      "SELECT * FROM customers WHERE id = ?", 
      [req.params.id]
    );
    
    if (customer.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    res.json({ customer: customer[0] });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

//the endpoints above can be used by updating the frontend. f


app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
