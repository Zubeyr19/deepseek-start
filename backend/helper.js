//helper.js  
import { customers } from "./mockdata.js";

export function createApiResponse(data, success = true, message = null) {
    return { 
        success, 
        timestamp: new Date().toISOString(),  
        message, 
        data, 
        metadata: { 
            count: Array.isArray(data) ? data.length : null
        } 
    };

} 


// for use to endpoints 

export const getCustomers = (req, res) => { 
    const location = req.query.location; 
    const filtered = location 
    ? customers.filter (c => c.location.toLowerCase() === location.toLowerCase())
    : customers; 

    res.json(createApiResponse(filtered, true, `Found ${filtered.length} customers`));
    
}; 

