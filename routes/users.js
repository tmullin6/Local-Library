//Import Express and create router with built in function
var express = require('express');
var router = express.Router();

/* Set router to execute callback when a GET request of a matching pattern is made. 
The pattern is defined by what the route is called when imported, in this case '/users',
and whatever is defined in this router function, in this case '/'.*/

router.get('/', function(req, res, next) {
  res.render('index',{head:"Users", title: "Here is the User page",body:"This is the second page of my express app"});
});

router.get('/cool',(req,res,next)=>{
  res.render('index',{head:'Express is COOL',title:'Another route added',body:'This is so cool'})
});

module.exports = router;
