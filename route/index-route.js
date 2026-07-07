const express = require('express');
const route = express.Router();
const mailmodel = require('../model/mail');
const usermodel = require('../model/user');
const {islogged} = require('../middleware/authorization');

route.get('/index',islogged,async (req,res)=>{

  try{

    let user = await usermodel.findById(req.session.userid).populate({
            path: "inbox",
            match: {
                trash:false
            },
            populate: [
                {
                    path: "from",
                    select: "firstname surname email"
                },
                {
                    path: "to",
                    select: "firstname surname email"
                }
            ]
          });

  if(!user){
    res.send("please login first");
  }
 

  res.render("indexpages/index",{user:user});
}
catch(err){
  res.send("Error occurred");
}
})


route.get('/compose',islogged,(req,res)=>{
  res.render("indexpages/compose");
});



route.post('/compose/:id',islogged,async(req,res)=>{

  try{
let user = await usermodel.findOne({_id:req.params.id});

const receiver = await usermodel.findOne({ email: req.body.to });

if (!receiver) {
    return res.send("Receiver not found");
}


let{subject ,message} = req.body;
  let mail = mailmodel({
        from:user._id,
        to:receiver._id,
        subject,
        message,
        starred:false,
        trash:false,
        draft:false,
        createdAt:Date.now(),
  });

  await mail.save();

  receiver.inbox.push(mail._id);
  user.sent.push(mail._id);
  await user.save();
  await receiver.save();
  req.flash("success","Mail send successfully");
  res.redirect('/indexroute/index');
}
catch(err){
req.flash("error","Something went - try again Later");
return  res.redirect('/indexroute/index');
}

})

route.get('/send',islogged,async (req,res)=>{
    try{
            const user = await usermodel.findById(req.session.userid).populate({
                path: "sent",
                populate: {
                    path: "to",
                    select: "firstname lastname email"
                }
            });
              
         res.render("indexpages/send", {
            user,
            sentMails: user.sent
        });
    }
    catch(err){
      res.send(err);
    }
});


route.get('/send_messages/:id',islogged,async (req,res)=>{
    let mail = await mailmodel.findById(req.params.id).populate("from").populate("to");
  res.render("indexpages/send_message",{mail:mail});
})


route.get('/inbox_messages/:id',islogged,async (req,res)=>{
    let mail = await mailmodel.findById(req.params.id).populate("from").populate("to");
  res.render("indexpages/inbox_message",{mail:mail});
});

route.get('/profilepic/:id', async (req, res) => {

    const user = await usermodel.findById(req.params.id);

    res.render("profile/updatepic", { user });

});


route.get('/profileupdate/:id',async (req,res)=>{
      let user = await usermodel.findById(req.params.id);

  res.render("profile/updateprofilepic",{user});
})


route.get('/start/:id',async (req,res)=>{

  try{
  let mail =await mailmodel.findById(req.params.id);

  if(!mail){
    console.log("mail is not found");
  }
  if(mail.starred===true){
    mail.starred=false;
  }
  else{
    mail.starred=true;
  }
  await mail.save();
  res.redirect('/indexroute/index');
}
catch(err){
  console.log("error",err);
}
});

route.get("/messages/:id",async (req,res)=>{
    try{
  let mail = await mailmodel.findById(req.params.id).populate("from").populate("to");
  res.render("indexpages/inbox_message",{mail:mail});
    }
    catch(err){
      console.log("error",error)
    }
})



route.get('/starred', islogged, async (req, res) => {
    try {

        const user = await usermodel.findById(req.session.userid).populate({
            path: "inbox",
            match: {
                starred: true
            },
            populate: [
                {
                    path: "from",
                    select: "firstname surname email"
                },
                {
                    path: "to",
                    select: "firstname surname email"
                }
            ]
        });

        res.render("indexpages/starred", {
            user
        });

    } catch (err) {
        res.send(err);
    }
});

route.post("/trash", islogged, async (req, res) => {

    const { ids } = req.body;

    await mailmodel.updateMany(
        { _id: { $in: ids } },
        {
            $set: {
                trash: true,
                starred: false
            }
        }
    );

    req.flash("success","move to trash");
    res.json({ success: true });

});

route.get('/sends', islogged, async (req, res) => {
    try {

        const user = await usermodel.findById(req.session.userid).populate({
            path: "inbox",
            match: {
                trash:true
            },
            populate: [
                {
                    path: "from",
                    select: "firstname surname email"
                },
                {
                    path: "to",
                    select: "firstname surname email"
                }
            ]
        });

        res.render("trash_bin/trash", {
            user
        });

    } catch (err) {
        res.send(err);
    }
});


route.get("/trash_bin/:id", islogged, async (req, res) => {
    try {

        const mail = await mailmodel.findById(req.params.id)
            .populate("from")
            .populate("to");

        if (!mail || !mail.from || !mail.to) {
            req.flash("error", "This mail has already been deleted.");
            return res.redirect("/indexroute/sends");
        }

        res.render("trash_bin/delete_request", { mail });

    } catch (err) {

        console.log(err);
        req.flash("error", "Something went wrong.");
        return res.redirect("/indexroute/sends");

    }
});



module.exports = route;