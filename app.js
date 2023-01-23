//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");

const { Mongoose, default: mongoose }=require("mongoose")
mongoose.set("strictQuery", true);
mongoose.connect("mongodb+srv://khemu:khemu123@cluster0.z4q4ct6.mongodb.net/todolistDB");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



const listSchema=new mongoose.Schema({
  name:String
})
const Item= new mongoose.model("item",listSchema);
const itme1=new Item({name:"Welcome"});
const itme2=new Item({name:"write your tasks"});
const itme3=new Item({name:"hit + to add task"});

const defaultItems=[itme1,itme2,itme3];

const customListSchema=new mongoose.Schema({
  name:String,
  item:[listSchema]
})
const customList=new mongoose.model("List",customListSchema);

app.get("/", function(req, res) {
 Item.find({},function(err,foundItems){
  
  if (foundItems.length===0) {
   
    Item.insertMany(defaultItems,function(err){
      if (err) {  
        console.log(err);
      } else {
        console.log("successfully inserted");
      }
    })
    res.redirect("/")
  } else {
    res.render("list", {listTitle:"Today", newListItems: foundItems,});
  } 
  })
});

app.post("/", function(req, res){
const nitem=req.body.newItem
const Listname=req.body.list;
  const itmename = new Item({name:nitem});
 


 if (Listname==="Today") {
    itmename.save();
  res.redirect("/")
    
  } else {
    customList.findOne({name:Listname},function(err,foundList){
        foundList.item.push(itmename);
        foundList.save();
        res.redirect("/"+Listname)
      
    })
  
  }
  
  
}); 




app.post("/delete",function(req,res){
  const checkedItemID=req.body.checkedItem;
  const Listname=_.capitalize(req.body.listname);
  
  
  if (Listname==="Today") {
    Item.findByIdAndDelete({_id:checkedItemID},function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted");
      }
    })
    res.redirect("/")
  } else {
  
   customList.findOneAndUpdate({name:Listname},{$pull:{item:{_id:checkedItemID}}},function(err,docs){
    if (!err) {
      res.redirect("/"+Listname)
      
    }
   })

  } 
  
})

app.get("/:newList",function(req ,res){
const newListName=_.capitalize(req.params.newList);

  customList.findOne({name:newListName},function(err,foundList){
    if (!err) {
      if (!foundList) {
      
        const NCLI=new customList({
          name:newListName,
          item:defaultItems
        })
        NCLI.save();
        res.redirect("/"+newListName)
      } else {
        
        res.render("list", {listTitle: foundList.name, newListItems:foundList.item})
      }
    }
  }) 
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work", newListItems: workItems});
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
