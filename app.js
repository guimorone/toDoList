//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-guilherme:Test123@cluster0-u4xbc.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}); //criando um database

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Sla"
});

const item3 = new Item({
  name: "BLABLABLA"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema] //array de itemsSchema
};

const List = mongoose.model("List", listSchema);

//delete
/*
//deletar um:
/*Item.deleteOne({name: "Peach"}, (err) => { //quero deleter o documento com nome: "Peach", posso usar id ou qualquer outra coisa
  if(err){
    console.log(err);
  } else{
    console.log("Succesfully deleted the document.");
  }
}); */

//deletar vários:

/*Item.deleteMany({name: "John"}, function(err){ //deletar todos os documentos cujo nome = "John"
  if(err){
    console.log(err);
  } else{
    console.log("Succesfully deleted all the documents.");
  }
*/

app.get("/", function(req, res) {

  //FIND
  Item.find({}, (err, foundItems) => { //foundItems = array
    if(err){
      console.log(err);
    } else{
      if(!foundItems.length) { //se ta vazio
        //ADD
        Item.insertMany(defaultItems, (err) => {
          if(err){
            console.log(err);
          } else {
            console.log("Successfully added Items to the database!");
          }
        });
        res.redirect("/"); //para usar o res.render do else abaixo
      } else{
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      }
      //console.log(foundItems);
    }
  });

});

app.get("/:customListName", (req, res) => {
  const cln = _.capitalize(req.params.customListName);

  List.findOne({name: cln}, (err, foundList) => { //foundList = objeto
    if(err){
      console.log(err);
    } else{
      if(!foundList){
        //Create a new list
        const list = new List({
          name: cln,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ cln); //para atualizar a página
      } else{
        //Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });

});

app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });

    if(listName === "Today"){
      item.save(); //insertOne
      res.redirect("/");
    } else {
      List.findOne({name: listName}, (err, foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
});

//deletar uma caixa de verificação
app.post("/delete", (req, res) => {
  //console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){ //default list
    //DELETE
    Item.findByIdAndRemove(checkedItemId, (err) => { //outro jeito de deletar, tem q ter essa função de callback pra deletar (se n n deleta ashasha).
      if(err){
        console.log(err);
      } else{
        console.log("Seccessfully deleted the checked item from database!");
      }
    });
    res.redirect("/");
  } else{
    //UPDATE
    //remover um item de um array mongoose
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
      if(err){
        console.log(err);
      } else{
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started Successfully!");
});
