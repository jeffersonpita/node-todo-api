require("./config.js")

var _ = require("lodash");
var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require("mongodb");


var {mongoose} = require("./db/mongoose.js");
var {Todo} = require("./models/todo.js");
var {User} = require("./models/user.js");

var app = express();
var port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res)=>{
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc)=>{
    res.send(doc);
  }, (e)=>{
    res.status(400).send(e);
  });

});

app.get("/todos", (req, res)=>{
    Todo.find().then((todos)=>{
      res.send({todos});
    }, (e)=>{
      res.status(400).send(e);
    });
});

app.get("/todos/:id", (req, res)=>{

    if(!ObjectID.isValid(req.params.id)){
      return res.status(404).send();
    }

    Todo.findById(req.params.id).then((todo)=>{
      if(!todo)
        res.status(404).send();
      else
        res.status(200).send({todo});
    }).catch((e)=>{
      res.status(400).send(e);
    });
});

app.delete("/todos/:id", (req, res)=>{
  if(!ObjectID.isValid(req.params.id)){
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(req.params.id).then((todo)=>{
    if(!todo)
      res.status(404).send();
    else
      res.status(200).send({todo});
  }).catch((e)=>{
    res.status(400).send(e);
  });
});


app.patch('/todos/:id', (req, res)=>{
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(req.params.id)){
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();

  }
  else {
    body.completedAt = null;
    body.completed = false;
  }

  Todo.findByIdAndUpdate( id, {$set: body}, {new: true}).then((todo)=>{
    if(!todo)
      return res.status(404).send();
    res.status(200).send({todo});
  }).catch((e)=>{
    res.status(400).send(e);
  });

});


// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token)=>{
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});


app.listen(port, ()=>{
  console.log('Started on port '+port);
});

module.exports = {app};

/*
var newTodo = new Todo({
  text: "Cook dinner"
});

newTodo.save().then((doc)=>{
  console.log('Saved todo', doc);
}, (e)=>{
  console.log('Unable to save todo.');
});
*/
/*
var newTodo1 = new Todo({
  text: '    a    '
});
newTodo1.save().then((doc)=>{
  console.log('Saved todo', doc);
}, (e)=>{
  console.log('Unable to save todo.', e);
});
*/
/*


var newUser = new User({
  email: ' asd@asd.com    '
});

newUser.save().then((doc)=>{
  console.log('Saved user', doc);
}, (e)=>{
  console.log('Unable to save user.');
});
*/
