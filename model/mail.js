const mongoose = require("mongoose");

const mailSchema = new mongoose.Schema({

    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

    subject:String,

    message:String,

    starred:{
        type:Boolean,
        default:false
    },

    trash:{
        type:Boolean,
        default:false
    },

    draft:{
        type:Boolean,
        default:false
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

module.exports = mongoose.model("Mail",mailSchema);