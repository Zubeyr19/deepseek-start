import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import pool from "./db.js"; // Ensure this is the correct path 
import {customers,products,orders} from "./mockdata.js";

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
    //Parse the message to determine what data to fetch 
    
  const message = message.toLowerCase(); 
    let responseText = "I dont have have the information you are looking for.";

    if (lowerMsg.includes("datanase statis")) {
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

    else if (lowerMsg.includes("customer") || lowerMsg.includes("client")) { 
      if (lowerMsg.includes("list") || lowerMsg.includes("all")) { 
        responseText = 'Here are our customers: ${JSON.stringify(customers.map(c => c.name))}'; 
        // use mockdata for new york customers  
        const nyCustomers = customers.filter(c => c.location === "New York"); 
        responseText ='Customers in New York: ${JSON.stringify(nyCustomers.map(c => c.name))}'; 
      }
    } 
    else if (lowerMsg.includes("customer") || lowerMsg.includes("client")) {  
      if (lowerMsg.includes("list") || lowerMsg.includes("all")) { 
        responseText = 'Here are our customers: ${JSON.stringify(customers.map(c => c.name))}';  
      } else if (lowerMsg.includes("new york")) { 
        const nyCustomers = customers.filter(c => c.location === "New York"); 
        responseText ='Customers in New York: ${JSON.stringify(nyCustomers.map(c => c.name))}'; 
      }
    } 
    // product queries  
    else if (lowerMsg.includes("product") || lowerMsg.includes("service")) { 
      if (lowerMsg.includes("software")) { 
        // request for software products  
        const softwareProducts = products.filter(p => p.category === "Software"); 
        responseText = 'Software products: ${JSON.stringify(softwareProducts.map(p => p.name))}'; 
      } else { 
        // request for all products 
        responseText = 'Our products: ${JSON.stringify(products.map(p => p.name))}';
      } 
    }  

    // order queries 
    else if (lowerMsg.includes("order") || lowerMsg.includes("sales")) { 
      if(lowerMsg.includes("recent") || lowerMsg.includes("latest")) {  
        // request most recent order 
        const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)); 
        const latestOrder = sortedOrders[0];  
        const customer = customers.find(c => c.id === latestOrder.customerId);  
        responseText = `Most recent order: ${JSON.stringify(latestOrder)}`;  
      }
      
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
    const location = req.query.location; 
    let query = "SELECT * FROM customers" 
    let params = []; 
    if (location) { 
      query += " WHERE location = ?";  
      params.push(location); 
    } 
    // Add limit  
    query +=" LIMIT 100"; 
    const customers = await pool.query("query, params");   
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

// Get all products
app.get("/api/products", (req, res) => {
  // Support filtering by category
  const category = req.query.category;
  if (category) {
    const filtered = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return res.json({ products: filtered });
  }
  res.json({ products });
});



// Get customer orders
app.get("/api/customers/:id/orders", (req, res) => {
  const customerOrders = orders.filter(o => o.customerId === req.params.id);
  res.json({ orders: customerOrders });
});

//the endpoints above can be used by updating the frontend. f


app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
