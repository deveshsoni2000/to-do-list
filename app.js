//toDoAppv2
//In this project we will be upgrading our ToDoApp v1 to v2 by adding a mongodb database using mongoose
//This will save our list items even after restarting our server.

//including necessary modules in our project
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");//using mongoose dependency in our project
// const date = require(__dirname+"/date.js"); // we removed date.js file here and thereby decreasing the complexity of our code
const app = express(); //server creation
//using lodash library in our project
const _ = require("lodash");
//using EJS in our server/project
app.set("view engine","ejs");
//using body-parser
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://deveshsoni2000:XlnwXoDiz8SJ1AMi@cluster0.ccpbl9u.mongodb.net/todolistDB",{useNewUrlParser: true});
mongoose.set('strictQuery', true);
// console.log(date.getDay());

//We won't need to use now array data structure to save our data instead we will use mongoose
// let items = [];//We declared this variable here to solve scope issue.
// let workItems=[];
//With below lines we created our schema 
const {Schema} = mongoose;
const itemsSchema = new Schema({
    name : String
});

//To use our schema definition, we need to convert our itemsSchema into a Model we can work with. 
//now we are creating the model like this:  mongoose.model(modelName, schema)
const Item = mongoose.model('Item',itemsSchema); //mongoose model name starts with capital

//The schema creation and model creation can be done in single line of code like this
//const Model = mongoose.model('Test', mongoose.Schema({ name: String }));

//Will add some default data to our database.
//For this we need to create documents. 
const item1 = new Item({
    name : "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name : "<-- Hit this to delete an item."
});

//now we add all this documents into an array.
const defaultItems = [item1,item2,item3];

const listSchema = {
    name : String,
    items : [itemsSchema]
};
const List = mongoose.model('List',listSchema);

app.get("/about",function(req,res){
    res.render("about");
});

app.get("/",function(req,res){
    // let day = date.getDate();
    //in ejs we use render method
    Item.find({},function(err,foundItems){
        if(foundItems.length === 0){
            //Now we will add all three default data in one go like this.
            Item.insertMany(defaultItems, function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Successfully saved default items to DB.");
            }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle : "Today", newListItems: foundItems});
        }
        }
    );
    
});

app.get("/:customListName",function(req,res){
    const customName = _.capitalize(req.params.customListName);
    // console.log(customName);
    List.findOne({name:customName},function(err,result){
        if(!err){
            if(result){
                // console.log("Exists!");
                //show existing list
                res.render("list",{listTitle : result.name, newListItems: result.items});
            }
            else{
                console.log("Not Exists!");
                //create list
                const list = new List({
                    name: customName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/"+customName);
            }
        }
    });
    
});

app.post("/",function(req,res){
    // console.log(req.body);
    
    const item = req.body.newItem;
    const listName = req.body.list;
    // console.log(item);
    const itemDoc = new Item({
        name: item
    });

    if(listName === "Today"){
        itemDoc.save();
        res.redirect("/");//So this will redirect to root then therefore above method will get called.
    }
    else{
        List.findOne({name:listName},function(err,result){
            // if(err){
            //     console.log(err);
            // }
            result.items.push(itemDoc);
            result.save();
            res.redirect("/"+listName);
        });
    }
});
app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.list;
    console.log(listName);
    console.log(checkedItemId);
    // this below method will find the id then then remove it and it also return the found value 
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("Successfully deleted the checked item.");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                // console.log(foundList);
                res.redirect("/"+listName);
            }
        });
    }
})


app.listen(3000,function(){
    console.log("Server started at 3000 PORT");
});