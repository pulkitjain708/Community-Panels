 var str="<div class="+"'alert alert-danger'"+ "role=alert style=width:90%;>Please Enter Correct Details </div>";
express=require('express');
app=express();
ejs=require('ejs');
session=require('express-session');
bodyparser=require('body-parser');
app.use(bodyparser());
var multer=require('multer');
nodemailer=require("nodemailer");
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'damon.satterfield@ethereal.email',
        pass: 'x18Z6uRdsbm2SYFkMg'
    }
});
mongoose=require('mongoose');
mongoose.connect("mongodb://localhost:27017/cq",{useNewUrlParser:true});
mongoose.pluralize(null);
var path="";
var storage = multer.diskStorage({
    destination : function (req, file, cb) {
      cb(null, './images')
    },
    filename: function (req, file, cb) {
        var arr=file.mimetype;
        console.log(file);
        arr=arr.split("/");
        arr=arr[1];
        path=req.session.email+"."+arr;
        req.session.address=path;
      cb(null, path)
    }
  })

app.use(express.static("public"));
app.use(express.static("images"));
var path;
   
        var upload = multer({ storage: storage })

commSchema=new mongoose.Schema({
    name:{
        type:String,
        required:1
    },
    desc:{
        type:String,
        required:true
    },
     rule:{
         type:String,
         enum:["Direct","Permission"]
     },
     path:String,
    activation:{
        type:String,
        enum:["Activated","Deactivated"]
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId , ref:"super",
        required:true
    },
    members:[{type:mongoose.Schema.Types.ObjectId , ref:"super"}],
    doc:String,
    ownerString:String,
    discussion:[
        {
        title:String,
        details:String,
        date:String,
        poster:String,
        time:String,
        postid:String,
        comments:[{
            commenter_id:String,
            commenter:String,
            time:String,
            text:String,
            cpic:String
        }]
    }
     ],
     request: [{type: mongoose.Schema.Types.ObjectId , ref:"super"}]
});
Comm=mongoose.model("comm",commSchema);
Schema=new  mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    loginStatus:Number,
    role:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    dob:String,
    city:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    gender:{
        type:String
    },
    profile:{
        type:String
    },
    status:String,
    activation:String
});
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
Super=mongoose.model("super",Schema);
app.set("view engine","ejs");
let authorize = (req,res,next)=>{
         if(req.session.isLoggedIn)
             next();
         else
        return res.render("CQ",{val:""});
};
app.get("/",(req,res)=>{
    if(req.session.isLoggedIn){
        res.redirect("/home");
    }
    else
    res.render("CQ",{val:""});
});
app.use(express.static("public"));
app.post("/",(req,res)=>{ 
    
   Super.findOne({email:{$eq:req.body.email},password:{$eq:req.body.password}},(err,data)=>{
               if(err) throw err;
              
               if(data){
                   if(data.activation=="deactivated") 
                   return res.render("notfound");
                req.session.isLoggedIn=true;
                req.session.email=data.email;
                req.session.pid=data._id;
                req.session.userStatus=0;
                req.session.role=data.role;
                req.session.name=data.username;
                req.session.address=data.profile;
                // inside this condition if data exists
            if(data.loginStatus==0){
                res.render("editInfo",{data:data,role:req.session.role,username:req.session.name,link:req.session.address,userStatus:req.session.userStatus});
            }
            else{
                res.redirect("/home");
            }
              }
             else{
                res.render("CQ",{val:str});
             }
    });
});

app.get("/addUser",authorize,(req,res)=>{
    res.render("addUser",{username:req.session.name,role:req.session.role,link:req.session.address,response:""});
});

app.post("/addUser",(req,res)=>{
    console.log(req.body);
    var emailUser=req.body.email;
    Super.findOne({email:{$eq:emailUser}},(err,fetched)=>{
        if(fetched){
            var str2= "<div class="+"'alert alert-danger'"+ "role=alert style=width:90%;>Email Already Exists</div>";
             res.render("addUser",{response:str2,username:req.session.name,role:req.session.role,link:req.session.address});     
        }
        else{
            var str2="<div class="+"'alert alert-success'"+ "role=alert style=width:90%;>Account Created</div>";
             new Super({
                 username:req.body.name,
                 email:req.body.email,
                 password:req.body.password,
                 phone:req.body.phone,
                 city:req.body.city,
                 role:req.body.roleoptions,
                 loginStatus:0,
                 status:"pending",
                 activation:"deactivated",
                 dob:"0000-00-00",
                 gender:"male"
             }).save((err)=>{
                 if(err) 
                 throw err;
             });
             res.render("addUser",{response:str2,username:req.session.name,role:req.session.role,link:req.session.address});
        }
    });
});
app.get("/changePassword",(req,res)=>{
    console.log("At request of password changing : " + req.session.userStatus);
    res.render("changePassword",{link:req.session.address,role:req.session.role,username:req.session.name,res:"",userStatus:req.session.userStatus});
});
app.post("/changePassword",(req,res)=>{
    str3="<div class="+"'alert alert-success'"+ "role=alert style=width:90%;>Password Changed</div>";
    str4="<div class="+"'alert alert-danger'"+ "role=alert style=width:90%;>Password didnt Changed</div>";
    oldPassword=req.body.oldPassword;
    newPassword=req.body.newPassword;
    
         Super.findOne({email:{$eq:req.session.email}},(err,data)=>{
             console.log(data);
             if(err) throw err;
               if(data.password==oldPassword){
                 Super.updateOne({email:{$eq:req.session.email}},{$set:{password:newPassword}},(err)=>{
                     if(err) throw err;
                 });
            res.render("changePassword",{link:req.session.address,res:str3,role:req.session.role,username:req.session.name});
             }
             else{
                res.render("changePassword",{link:req.session.address,res:str4,role:req.session.role,username:req.session.name});
             }
         });
});

app.post("/editProfile",upload.single("profilePhoto"),(req,res)=>{
    Super.findOne({email:{$eq:req.session.email}},(err,data)=>{
        if(err) throw err;
        else{
            Super.updateOne({email:{$eq:req.session.email}},{
                 $set:
                 {
                     username:req.body.username,
                     loginStatus:1,
                     phone:req.body.phone,
                     city:req.body.city,
                     dob:req.body.dob,
                     gender:req.body.gender,
                     profile:path,
                     status:"Pending"
                 }
            },(err)=>{
                if(err) throw err;
                else{
                    console.log("Sucessfully Updated");
                    res.redirect("/home");//,{data:data,role:req.session.role,link:req.session.address,username:req.session.name,userStatus:req.session.userStatus});
                }
            }
            )
        }
    });
});

app.get("/userList",authorize,(req,res)=>{
    res.render("userList",{role:req.session.role,username:req.session.name,link:req.session.address});
});
app.post("/userList",(req,res)=>{
     var total;
     Super.count({},(err,data)=>{
         total=data;
     });
    var query={};
    sortvalue=0;
    query.skip=parseInt(req.body.start);
    query.limit=parseInt(req.body.length);
    obj=req.body.order[0];
    if(obj.dir=="asc") sortvalue=1;
    else sortvalue=-1;
    switch(parseInt(obj.column)){
        case 0: value="email"; break;
        case 1: value="phone"; break;
        case 2: value="city"; break;
        case 3: value="role"; break;
        case 4: value="username"; break;
    }
     str=req.body.search.value;
   if(str){
       var regexp= new RegExp(str,"i");
       searching={$or:[{"username":regexp},{"name":regexp},{"role":regexp},{"city":regexp}]};
   }
   else 
   searching={};
   if(req.body.role){
       searching.role=req.body.role;
   }
   if(req.body.status){
       searching.status=req.body.status;
   }
    query.sort={[value]:sortvalue};
    console.log(searching);
       Super.find(searching,null,query,(err,data)=>{
          res.send({"recordsTotal":total,"recordsFiltered":total,data});
       });
});
app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/");
});
app.get("/home",authorize,(req,res)=>{
    Super.findOne({email:{$eq:req.session.email}},(err,data)=>{
        res.render("home",{data:data,role:req.session.role,username:req.session.name,link:req.session.address,userStatus:req.session.userStatus});    
    });  
});
app.post("/sendMail",(req,res)=>{
    console.log(req.body);
    transporter.sendMail(req.body).then(info=>{
        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    });
    res.end();
});
app.post("/editUserList",(req,res)=>{
    Super.updateOne({email:{$eq:req.body.email}},{
             $set:
             {   
                 phone:req.body.phone,
                 city:req.body.city,
                 status:req.body.status,
                 role:req.body.role
             }
         },(err)=>{
             if(err) throw err
             else console.log("Successfully Updated");
         }
    )
    
   res.end();
});
app.post("/updateActivation",(req,res)=>{
   Super.findOne({email:{$eq:req.body.e}},(err,data)=>{
       if(data.activation=="activated") {
           data.activation="deactivated"
       }
       else{
           data.activation="activated"
       }
       data.save();
   });
   res.end();
});
app.get("/cp",(req,res)=>{
        res.render("communityPanel",{link:req.session.address,role:req.session.role,username:req.session.name}); 
});
app.get("/cc",(req,res)=>{
    res.render("createCommunity",{link:req.session.address,role:req.session.role,username:req.session.name});
});
// app.get("*",(req,res)=>{
//     res.render("notfound");
// })
app.get("/communityList",(req,res)=>{
    res.render("communityList",{link:req.session.address,role:req.session.role,username:req.session.name});
});
app.post("/createCommunity",(req,res)=>{
    Comm.findOne({name:{$eq:req.body.communityName}},(err,data)=>{
        if(data){
            console.log("Community already Exists..");
        }
        else{
            new Comm({
                name:req.body.communityName,
                desc:req.body.description,
                rule:req.body.commrule,
                path:"Not available",
                owner:req.session.pid,
                activation:"Deactivated",
                ownerString:req.session.name,
                doc: new Date().toLocaleString()
            }).save();
        }
    });
    res.redirect("cp");
});
app.post("/communityList",(req,res)=>{
    var total;
    query={}
    sortvalue=0;
    query.skip=parseInt(req.body.start);
    query.limit=parseInt(req.body.length);
    obj=req.body.order[0];
    if(obj.dir=="asc") sortvalue=1;
    else sortvalue=-1;
    switch(parseInt(obj.column)){
        case 0: value="name"; break;
        case 1: value="rule"; break;
        case 2: value="ownerString"; break;
        case 3: value="doc"; break;
    }
    query.sort={[value]:sortvalue};
    str=req.body.search.value;
    if(str){
        var regexp= new RegExp(str,"i");
        searching={$or:[{"name":regexp},{"rule":regexp},{"ownerString":regexp},{"doc":regexp}]};
    }
    else 
    searching={};
    if(req.body.rule){
        searching.rule=req.body.rule
    }
    //code for correcting search count
    Comm.find(searching,null,query,(err,data)=>{
        res.send({"recordsTotal":total,"recordsFiltered":total,data});
     });
});
app.post("/updateCommunity",(req,res)=>{
    Comm.findOne({_id:{$eq:req.body._id}},(err,data)=>{
        data.name=req.body.name
        data.desc=req.body.desc
        data.rule=req.body.rule
        data.activation=req.body.activation
        data.save();
    })
    res.end()
});
app.get("/switchasuser",(req,res)=>{
    req.session.userStatus=1
    res.render("switch");
});
app.get("/switchasadmin",(req,res)=>{
    req.session.userStatus=0
    res.render("switchAdmin");
});
app.get("/editInfo",(req,res)=>{
   Super.findOne({_id:{$eq:req.session.pid}},(err,data)=>{
    res.render("editInfo",{data:data,role:req.session.role,username:req.session.name,link:req.session.address});
   });
});
app.post("/getComm",(req,res)=>{
    Comm.find({$or:[{owner:req.session.pid},{members:{$in:[req.session.pid]}}]},(err,data)=>{
        res.send(data);
    })
});
app.get("/list",(req,res)=>{
    res.render("list",{role:req.session.role,username:req.session.name,link:req.session.address});
});
app.post("/commChangeList",(req,res)=>{
    if(req.body.value!="null")
    {
      var regex=new RegExp(req.body.value,"i");
      searching={"name":regex};
    }
    else {
            searching={};
    }
    searching.members={"$nin":[req.session.pid]}
    searching.owner={"$ne":[req.session.pid]}
    console.log(searching);
     Comm.find(searching,(err,data)=>{
         res.send(data);
       })
});
app.post("/join",(req,res)=>{
    Comm.findOne({_id:{$eq:req.body.communityId}},(err,data)=>{
        data.members.push(req.session.pid);
        data.save();
        res.end();
    });
});
app.get("/discussion/:id",(req,res)=>{
    id=req.params.id;
   Comm.findOne({_id:{$eq:id}},(err,data)=>{
       res.render("discussions",{role:req.session.role,username:req.session.name,link:req.session.address,cname:data.name,cid:data._id});
   });
});
app.get("/communitymembers/:id",(req,res)=>{
  id=req.params.id;
  Comm.find({_id:{$eq:id}}).populate("members","username profile").exec((err,data)=>{
      
      res.render("Members&Managers",{role:req.session.role,username:req.session.name,link:req.session.address,data:data,cname:data[0].name,cid:id})
  });
});
app.post("/addDiscussion",(req,res)=>{
    cid=req.body.commid;
    console.log(cid);
    var time=new Date();
    dsdate= time.getDate() + "/" + (time.getMonth()+1) + "/" + time.getFullYear();
    pdetails=req.body.details;
    ptitle=req.body.title;
    Comm.updateOne({_id:{$eq:cid}},{
        $push:{
            "discussion":{
                title:ptitle,
                details:pdetails,
                date: dsdate,
                time:time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
                poster:req.session.name,
                postid:req.session.pid
            }
        }
    },(err,ressult)=>
        {
                    if(err) throw err;
                    console.log(ressult)
        }
    );
    res.end();
});
app.post("/getDiscussions",(req,res)=>{
    id=req.body.commid;
    Comm.findOne({_id:{$eq:id}},(err,data)=>{
        res.send(data.discussion);
    });
});
app.get("/communityprofile/:id",(req,res)=>{
    id=req.params.id;
    Comm.findOne({_id:{$eq:id}}).populate("members").exec((err,data)=>{
        res.render("commprofile",{role:req.session.role,username:req.session.name,link:req.session.address,cname:data.name,cid:data._id,data:data});
    });
        // res.render("commprofile",{role:req.session.role,username:req.session.name,link:req.session.address,cname:data.name,cid:data._id,data:data});
});
app.get("/viewprofile/:id",(req,res)=>{
 id=req.params.id;
 Super.findOne({_id:{$eq:id}},(err,data)=>{
     res.render("viewprofile",{role:req.session.role,username:req.session.name,link:req.session.address,data:data})
 });
});
app.post("/addComment",(req,res)=>{
    cid=req.body.comid;
    did=req.body.disid;
    cmt=req.body.comment;
    time=new Date()
       // BLAAH BLAH code for pushing comments into discussion thread
    Comm.findOne({_id:{$eq:cid}},(err,data)=>{
        for(i=0;i<data.discussion.length;i++){
            if(data.discussion[i]._id==did){
                data.discussion[i].comments.push({
                    commenter:req.session.name,
                    commenter_id:req.session.pid,
                    text:cmt,
                    cpic:req.session.address,
                    time:time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                });
            }
        }
        data.save();
        res.send();
    })
});
app.post("/viewComments",(req,res)=>{
    cid=req.body.comid;
    did=req.body.disid;
     
         Comm.findOne({_id:{$eq:cid}},(err,data)=>{
                for(i=0;i<data.discussion.length;i++){
                    if(data.discussion[i]._id==did){
                        res.send(data.discussion[i].comments);
                        break;
                    }
                }
                res.end();
         });
});
app.get("/manageCommunity/:id",(req,res)=>{
   id=req.params.id;
    Comm.findOne({_id:{$eq:id}},(err,data)=>{
    console.log(data)
         res.render("manageCommunity",{role:req.session.role,username:req.session.name,link:req.session.address,data:data,cname:data.name,cid:id})
    })
});
app.post("/joinPermission",(req,res)=>{
    id=req.body.comId;
    Comm.findOne({_id:{$eq:id}},(err,data)=>{
        if(data.request.includes(req.session.pid)) res.send("Already exists");
        else{
            data.request.push(req.session.pid);
            data.save();
            res.end()
        }
    })
});
app.post("/showRequests",(req,res)=>{
    id=req.body.id;
  Comm.findOne({_id:{$eq:id}}).populate("request","profile username").exec((err,data)=>{
      res.send(data)
  })
});
app.post("/removeRequest",(req,res)=>{
    cid=req.body.cid
    pid=req.body.perid
    console.log(cid + " "+ pid)
    Comm.updateOne({_id:{$eq:cid}},{$pull:{request:{$in:[pid]}}},(err,res)=>{
        console.log(res);
        console.log(err);
    })
    res.end()
})
app.post("/acceptRequest",(req,res)=>{
    cid=req.body.cid
    pid=req.body.perid
    Comm.updateOne({_id:{$eq:cid}},{$pull:{request:{$in:[pid]}}},(err,res)=>{
        console.log(res);
        console.log(err);
    })
    Comm.findOne({_id:{$eq:cid}},(err,data)=>{
        data.members.push(pid);
        data.save();
    })
    res.end()
})
app.listen(8080,()=>{
    console.log("cq serving at 8080")
})
