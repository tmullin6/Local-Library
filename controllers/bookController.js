const Book = require('../models/book');
const Author = require('../models/author');
const BookInstance = require('../models/bookinstance');
const Genre = require('../models/genre');

const async = require('async');
const {body,validationResult}=require('express-validator');


exports.index = function(req, res){

    async.parallel({
        book_count: function(callback){
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function(callback){
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback){
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count: function(callback){
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback){
            Genre.countDocuments({}, callback);
        }
    }, function(err, results){
        res.render('index', {page: 'Home',title: 'Local Library', error: err, data: results });
    });
};

// Display list of all books.
exports.book_list = function(req, res,next){
    Book.find({},'title author')
    .sort({title: 1})
    .populate('author')
    .exec((err,book_list)=>{
        if(err){return next(err)};
        res.render('book-list',{page: "Book List", title: "Local Library", book_list: book_list});
    });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {

    async.parallel({

        book: function(callback) {

            Book.findById(req.params.id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        
        book_instance: function(callback){
            BookInstance.find({'book': req.params.id})
            .exec(callback);
        },
    },
        function(err,results){
            if (err){next(err)};
            if(results.book==null){
                let error = new Error("Book Not Found");
                error.status=404;
                return next(error);
            };
            res.render("book-details",{page: results.book.title,title:"Local Library",
            book:results.book,book_instances: results.book_instance});
        });
    
};

// Display book create form on GET.
exports.book_create_get = function(req,res,next) {

    async.parallel({

        authors: function(callback){
            Author.find(callback);
        },

        genres: function(callback){
            Genre.find(callback);
        },
    }, function(err,results){
        if(err){return next(err)};

        res.render('book-form',{page:"Add New Book",title:"Local Library",
        authors:results.authors,genres:results.genres});
    });
    
};

// Handle book create on POST.
exports.book_create_post = [

    //Convert Genres to Array
    (req,res,next)=>{
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre === 'undefined'){
                req.body.genre=[];
            }
            else{
                req.body.genre=new Array(req.body.genre);
            }
        }
        next();
    },

    //Validate and Sanitize Inputs
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    (req,res,next)=>{

        const errors = validationResult(req);

        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });

        if(!errors.isEmpty()){

            async.parallel({
                authors: function(callback){
                    Author.find(callback);
                },

                genres: function(callback){
                    Genre.find(callback);
                },
            }, function(err,results){
                if(err){return next(err)};

                for(let i=0; i<results.genres.length; i++ ){
                    if (book.genre.indexOf(results.genres[i]._id) != -1) {
                        results.genres[i].checked= 'true';
                    }
                }

                res.render('book-form',{page:"Add New Book",title:"Local Library",
                authors:results.authors,genres:results.genres,book:book,errors: errors.array()});
                return;
            });
        }
        else{
            book.save(function(err){
                if(err){return next(err)};
                res.redirect(book.url);
            });
        };
    }
];

// Display book delete form on GET.
exports.book_delete_get = function(req,res,next) {
    
    async.parallel({

        book: function(callback){
            Book.findById(req.params.id).exec(callback);
        },

        book_instances: function(callback){
            BookInstance.find({'book': req.params.id}).exec(callback);
        },
    }, function(err,results){
        if(err){return next(err)};

        if(results==null){
            let error = new Error("Book Not Found");
            error.status=404;
            return next(error);
        };

        res.render('book-delete', {page: "Delete "+results.book.title,title:"Local Library",
        book: results.book, book_instances:results.book_instances});
    });
};

// Handle book delete on POST.
exports.book_delete_post = function(req,res,next) {
    
    async.parallel({
        book: function(callback){
            Book.findById(req.body.bookid).exec(callback);
        },

        book_instances: function(callback){
            BookInstance.find({'book': req.body.bookid}).exec(callback);
        },
    }, function(err,results){
        if(err){return next(err)};

        if(results.book_instances.length >0){
            res.render('book-delete', {page: "Delete "+results.book.title,title:"Local Library",
            book: results.book, book_instances:results.book_instances}); 
            return;  
        }
        else {
            Book.findByIdAndRemove(req.body.bookid, function deleteBook(err){
                if(err){return next(err)};

                res.redirect('/catalog/books');
            });
        }
    }
    )
};

// Display book update form on GET.
exports.book_update_get = function(req,res,next) {
    
    async.parallel({
        book: function(callback){
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },

        authors: function(callback){
            Author.find(callback);
        },

        genres: function(callback){
            Genre.find(callback);
        },
    }, function(err,results){
        if(err){return next(err)};

        if(results==null){
            let error = new Error('Book not Found');
            error.status=404;
            return next(error);
        };

        for(let i=0; i<results.genres.length;i++){
            for(let j=0; j<results.book.genre.length;j++){
                if(results.genres[i]._id.toString()===results.book.genre[j]._id.toString()){
                    results.genres[i].checked='true';
                }
               
            };
        };
    
    res.render('book-form',{page:'Update '+results.book.title, title: "Local Library",
    authors: results.authors, book: results.book, genres: results.genres});
});
};

// Handle book update on POST.
exports.book_update_post = [

    (req,res,next)=>{

        if(!(req.body.genre instanceof Array)) {
            if(req.body.genre==='undefined'){
                req.body.genre=[];
            }
            else{
                req.body.genre=new Array(req.body.genre);
            };
        };
        next();
    },

    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),
    
    function(req,res,next) {

        const errors = validationResult(req);

        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof(req.body.genre)==='undefined') ? [] : req.body.genre,
            _id: req.params.id
        });


        
        if(!errors.isEmpty()){

            async.parallel({
                authors: function(callback){
                    Author.find(callback);
                },

                genres: function(callback){
                    Genre.find(callback);
                },
            }, function(err,results){
                if(err) {return next(err)};

                for (let i=0;i<results.genres.length;i++){
                    if(book.genre.indexOf(results.genres[i]._id)>1){
                        results.genres[i].checked='true';
                    };
                };
                res.render('book-form',{page: "Update "+book.title, title: "Local Library",
                authors: results.authors, book:book,genres:results.genres,errors: errors.array()});
            });
        }

        else {
            Book.findByIdAndUpdate(req.params.id,book,{},function(err,newBook){
                if(err){return next(err)};

                res.redirect(newBook.url);
            });
        }
    }
];
