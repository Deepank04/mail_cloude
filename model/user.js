const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('database connected successfully');
})
.catch((err)=>{
    console.log(err);
})


const userschema = mongoose.Schema({

  firstname:String,
  surname:String,
  dob:{
    type:Date,
    
  },
  gender:{
    type:String,
    enum:['male','female','Rather not say','custom'],
   
  },
    inbox: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mail"
    }],

    sent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mail"
    }],
  email:String,
  password:String,
  image:String,
});


module.exports = mongoose.model("user",userschema);