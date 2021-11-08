const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const async = require('async');
const {body,validationResult}=require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    BookInstance.find().populate('book').exec(function(err,bookinstance_list){
        if(err) {return next(err)};
        res.render('bookinstance-list',
        {page: 'Book Availability',title: 'Local Library',bookinstance_list: bookinstance_list});
    })
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id).populate('book').exec(function(err,results){
        
        if(err){next(err)};
        if(results==null){
            let error= new Error("Book Copy Not Found");
            error.status=404;
            next(error);
        }

        res.render("bookinstance-details",{page: results.book.title, title: "Local Library", bookinstance: results});
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req,res,next) {
    Book.find({},'title').exec(function(err,results){
        if(err){return next(err)};

        res.render('bookinstance-form',{page:"Add New Book Instance",title:"Local Library",books:results});
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

      // Validate and sanitise fields.
      body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
      body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
      body('status').escape(),
      body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

      (req,res,next)=>{

        const errors=validationResult(req);

        let bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if(!errors.isEmpty()){

            Book.find({},'title').exec(function(err,results){
                if(err){return next(err)};

                res.render('bookinstance-form',{page:"Create New Book Instance", title:"Local Library",
                books:results,selected_book:bookinstance.book._id,bookinstance:bookinstance, 
                errors: errors.array()});
                return;
            })
        }
        else{
            bookinstance.save(function(err){
                if(err){return next(error)};

                res.redirect(bookinstance.url);
            });
        };
      }];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req,res,next) {
    BookInstance.findById(req.params.id).populate('book').exec(function(err,results){
        if(err){return next(err)};

        if(results==null){
            let error = new Error("Book Instance Not Found");
            error.status=404;
            return next(error);
        };

        res.render('bookinstance-delete',{page: "Delete "+results.imprint, title: "Local Library",bookinstance: results});
    })
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req,res,next) {
    BookInstance.findByIdAndRemove(req.body.bookinstance_id, function deleteBookInstance(err){
        if(err){return next(err)};

        res.redirect('/catalog/bookinstances');
    })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req,res,next) {
  
    async.parallel({
        books: function(callback){
            Book.find({},'title').exec(callback);
        },

        book_instance: function(callback){
            BookInstance.findById(req.params.id).populate('book').exec(callback);
        }, 
    }, function(err,results){
        if(err){return next(err)};

        if(results.book_instance==null){
            let error = new Error("Book Instance Not Found");
            error.status=404;
            return next(error);
        };

        res.render("bookinstance-form",{page: "Update "+results.book_instance.imprint, title: "Local Library",
               books:results.books,bookinstance:results.book_instance});
    });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    (req,res,next)=>{

        const errors = validationResult(req);

        let bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id 
        });

        if(!errors.isEmpty()){

            async.parallel({

            books: function(callback){
                Book.find({},'title').exec(callback);
            },
    
            book_instance: function(callback){
                BookInstance.findById(req.params.id).populate('book').exec(callback);
            }, 
        }, function(err,results){
            if(err){return next(err)};
    
            res.render("bookinstance-form",{page: "Update "+results.book_instance.imprint, title: "Local Library",
                books:results.books,bookinstance:results.book_instance, errors: errors.array()});
        });
        }
        else {
            BookInstance.findByIdAndUpdate(req.params.id,bookinstance,{},function(err,newBookInstance){
                if(err){return next(err)};

                res.redirect(newBookInstance.url);
            });
        }
    }
];