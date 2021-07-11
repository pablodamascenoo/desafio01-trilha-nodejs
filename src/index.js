const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  user = users.find((user)=> user.username == username);

  if(!user){
    return response.status(404).json({error: "usuário não encontrado"});
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  if(users.some((user)=> user.username == username)){

    return response.status(400).json({error: "usuário já registrado"});
  }

  user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.send(user.todos);
  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  let {user} = request;
  const {title, deadline} = request.body;

  const todo ={ 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  let {user} = request;
  const {title, deadline} = request.body;

  index = user.todos.findIndex((todo)=> todo.id == id);

  if(index == -1){
    return response.status(404).json({error: "todo não existe"});
  }

  user.todos[index].title = title;
  user.todos[index].deadline = new Date(deadline);

  return response.send(user.todos[index]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  let {user} = request;

  index = user.todos.findIndex((todo)=> todo.id == id);

  if(index == -1){
    return response.status(404).json({error: "todo não existe"});
  }

  user.todos[index].done = true;

  return response.send(user.todos[index]);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  let {user} = request;

  index = user.todos.findIndex((todo)=> todo.id == id);

  if(index>-1){
    user.todos.splice(index, 1);
  }
  else{
    return response.status(404).json({error: "todo não existe"});
  }

  return response.status(204).send();
});

module.exports = app;