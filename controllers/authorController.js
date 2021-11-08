const Author = require("../models/author");
const Book = require("../models/book");

const async = require("async");
const {body,validationResult}=require('express-validator');

//Display list of All Authors
exports.author_list = function(req,res,next){
    Author.find().sort([["last_name","ascending"]]).exec(function(err,author_list){
        if (err){next(err)};
        res.render('author-list',{page:"Authors",title: "Local Library",author_list:author_list});
    })
};

//Displays Details of a Specific Author
exports.author_detail = function(req,res, next){

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
              .exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('author-details', { page: results.author.name, title: 'Local Library', 
        author: results.author, author_books: results.authors_books } );
    });
};

//Display Author create 'Get' Form
exports.author_create_get= function(req,res,next){
    res.render('author-form',{page: "Add New Author", title: "Local Library"})
};

//Displays Author create 'POST' form
exports.author_create_post= [

    //validate and Sanitize input fields
    body('first_name').trim().isLength({min:1}).escape().withMessage("First Name must be specified")
    .isAlphanumeric().withMessage("Name cannot contain non-alphanumeric characters"),

    body('last_name').trim().isLength({min:1}).escape().withMessage("Last Name must be specified")
    .isAlphanumeric().withMessage("Name cannot contain non-alphanumeric characters"),

    body('date_of_birth','Invalid Date of Birth').optional({checkFalsy:true}).isISO8601().toDate(),
    body('date_of_death','Invalid Date of Death').optional({checkFalsy:true}).isISO8601().toDate(),

    (req,res,next)=>{
        
        
        const errors = validationResult(req);

        //check is there are errors and re-render page if errors exist
        if(!errors.isEmpty()){
            res.render('author-form',{page:"Add New Author",title: "Local Library",
            author: req.body,errors: errors.array()});
            return;
        }

        else{

            let author = new Author({
                first_name: req.body.first_name,
                last_name:req.body.last_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });

            author.save(function(err){
                if(err){return next(err);}
                res.redirect(author.url)
            });
        };
    }
];

//Displays Author delete 'GET' form
exports.author_delete_get= function(req,res,next){
    
    async.parallel({

        author: function(callback){
            Author.findById(req.params.id).exec(callback)
        },
        author_books: function(callback) {
            Book.find({'author':req.params.id}).exec(callback)
        },
        }, function(err,results){
            if(err){return next(err)};
            if(results.author==null){
                res.redirect('/catalog/authors');
            };
            res.render('author-delete', {page:"Delete "+results.author, title: "Local Library", 
            author: results.author, author_books: results.author_books});
            return;   
        })
};

//Displays Author delete 'POST form
exports.author_delete_post= function(req,res,next){
    
    async.parallel({

        author: function(callback){
            Author.findById(req.body.authorid).exec(callback)
        },
        author_books: function(callback) {
            Book.find({'author':req.body.authorid}).exec(callback)
        },
    },
    function(err,results){
        if(err){return next(err)};

        if(results.author_books.length >0){
            res.render('author-delete', {page:"Delete "+results.author, title: "Local Library", 
            author: results.author, author_books: results.author_books});
            return;
        }
        else{
            Author.findByIdAndRemove(req.body.authorid,function deleteAuthor(err){
                if(err){return next(err)};

                res.redirect('/catalog/authors');
            });
        };
    });
};

//Displays Author update 'GET' form 
exports.author_update_get= function(req,res, next){

    Author.findById(req.params.id).exec(function(err,results){
        if(err){return next(err)};

        if(results==null){
            let error = new Error("Author Not Found");
            error.status=404;
            return next(error);
        };

        res.render("author-form", {page: "Update "+results.name, title: "Local Library", author: results});
    });
};

//Displays Author update 'POST' form
exports.author_update_post= [

    body('first_name').trim().isLength({min:1}).escape().withMessage("First Name must be specified")
    .isAlphanumeric().withMessage("Name cannot contain non-alphanumeric characters"),

    body('last_name').trim().isLength({min:1}).escape().withMessage("Last Name must be specified")
    .isAlphanumeric().withMessage("Name cannot contain non-alphanumeric characters"),

    body('date_of_birth','Invalid Date of Birth').optional({checkFalsy:true}).isISO8601().toDate(),
    body('date_of_death','Invalid Date of Death').optional({checkFalsy:true}).isISO8601().toDate(),

    (req,res,next)=>{

        const errors=validationResult(req);

        let author = new Author({
            first_name: req.body.first_name,
            last_name:req.body.last_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id:req.params.id
        });

        if(!errors.isEmpty()){
            Author.findById(req.params.id).exec(function(err,results){

                if(err){return next(err)};

                res.render('author-form',{page:"Update "+results.name, title:"Local Library",
                author: results,errors: errors.array()});
            });
        }
        else {
            Author.findByIdAndUpdate(req.params.id,author,{},function(err,newAuthor){
                if(err){return next(err)};

                res.redirect(newAuthor.url);
            });
        };
    }];
