export const customers = [ 
    {id: "C001", name: "Acme Corp", email: "contact@acme.com", location: "New York", revenue: 1250000 }, 
    {id: "C002", name: "Beta Corp", email: "contact@beta.com", location: "San Francisco", revenue: 8900000}, 
    {id: "C003", name: "Gamma Corp", email: "contact@gamma.com", location: "Los Angeles", revenue: 2100000}, 
    {id: "C004", name: "Delta Corp", email: "contact@delta.com", location: "New York", revenue: 7500000},  
    {id: "C005", name: "Delta Corp", email: "contact@delta.com", location: "New York", revenue: 14500000}

]; 

export const products = [ 
    {id: "P001", name: "Product A", category: "Software", price: 12500}, 
    {id: "P002", name: "Cloud Infrastructure Service", category: "Services", price: 4999}, 
    {id: "P003", name: "Data Processing Engine", category: "Software",  price: 8750}, 
    {id: "P004", name: "Enterprise Security Package", category: "Software",  price: 15000}, 
    {id: "P005", name:"Technical Consulting", category: "Services", price: 200}, 
]; 

export const orders = [
    { id: "O001", customerId: "C001", date: "2023-06-15", total: 37500, items: ["P001", "P004"] },
    { id: "O002", customerId: "C003", date: "2023-07-22", total: 12500, items: ["P001"] },
    { id: "O003", customerId: "C002", date: "2023-08-05", total: 4999, items: ["P002"] },
    { id: "O004", customerId: "C001", date: "2023-09-10", total: 8750, items: ["P003"] },
    { id: "O005", customerId: "C005", date: "2023-10-18", total: 17000, items: ["P004", "P005"] }
  ];
