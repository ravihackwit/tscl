const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();  // Load environment variables from .env file

const app = express();
app.use(bodyParser.json());
const mongoURI = "mongodb://TsclAdmin:Tscl2024@13.48.10.96:27017/tscl?directConnection=true";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define a schema for storing webhook messages
const messageSchema = new mongoose.Schema({
    name: String,
    key: String,
    message: String,
    from: String,
    groupId: String,
    timeStamp: Number,
    metadata: Object
});

// Define a schema for storing webhook messages
const zoneSchema = new mongoose.Schema({
    zone_id: {
        type: String
    },
    zone_name: {
        type: String
    },
    status: {
        type: String
    },
    created_by_user: {
        type: String
    }
}, { timestamps: true });

// Create a model for the messages
const Message = mongoose.model('Message', messageSchema);
const Zone = mongoose.model('Zone', zoneSchema);

// Authentication token configuration
//const expectedAuthHeader = 'Basic YWJjZGVm';  // Example Base64 token for 'username:abcdef'

// Endpoint to receive webhook data
app.post('/dept', async (req, res) => {
    try {
      
     
        const data = req.body;
        console.log('Received Data:', data);
        
        // Extract the required information from the request body
        const { key, message, from, groupId, metadata } = data;
        
        // Save the data to MongoDB
        const savedMessage = await Message.create({
          name: "dept",
          key: key,
          message: message,
          from: from,
          groupId: groupId.toString(),
          timeStamp: Date.now(),
          metadata: metadata
        });

        const zoneData = await Zone.find();
    
        console.log(zoneData);
        let zoneArray=[];
        for(var zone in zoneData) {
            const resZone =  {"title":zoneData[zone].zone_name,"message":zoneData[zone].zone_name,
                "replyMetadata": {"KM_TRIGGER_EVENT":"Zone"}

            }
            zoneArray = zoneArray.concat(resZone);
        }
        

        var datas =[ {
            "message": "Please Select Your Zone",
            "metadata": {
            "contentType": "300",
                "templateId": "6",
                "payload": zoneArray
                
            }
        }]
        console.log('Message saved:', savedMessage);
        res.send(datas);
      
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).send('Internal Server Error');
    }
  });


  

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
