var Author = require('../models/author');
var Book = require('../models/book');
var async = require('async');
const validator = require('express-validator');

// Display list of all authors
exports.author_list = function(req, res, next) {
    Author.find()
        .populate('author')
        .sort([['family_name', 'ascending']])
        .exec(function(err, list_authors) {
            if(err) { return next(err); }
            //Successful, so render
            res.render('author_list', { title: 'Author List', author_list: list_authors });
        });
};

// Display detail page for a specific author
exports.author_detail = function(req, res, next) {
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
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });
};

// Display Author create form on GET
exports.author_create_get = function(req, res, next) {
    res.render('author_form', { title: 'Create Author'});
};

// Handle Author create on POST
exports.author_create_post = [
    // Validate fields and sanitize
    validator.body('first_name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('First name must be specified.')
        .isAlphanumeric()
        .withMessage('First name has non-alphanumeric characters.')
        .escape(),

    validator.body('family_name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Family name must be specified.')
        .isAlphanumeric()
        .withMessage('Family name has non-alphanumeric characters.')
        .escape(),

    validator.body('date_of_birth', 'Invalid date of birth')
        .optional({ checkFalsy: true })
        .isISO8601()
        .escape(),

    validator.body('date_of_death', 'Invalid date of death')
        .optional({ checkFalsy: true })
        .isISO8601()
        .escape(),

    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validator.validationResult(req);

        if(!errors.isEmpty()){
            // There are errors. Render the form again with sanitized values/error messages
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        } 
        else {
            // Data form is valid
            // Create an Author object with escaped and trimmed data
            var author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            author.save(function(err) {
                if(err) { return next(err); }
                //Successful, so redirect to new author record
                res.redirect(author.url);
            });
        }
    }
];

// Display Author delete form on GET
exports.author_delete_get = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if(err) { return next(err); }
        if(results.author==null) {
            res.redirect('/catalog/authors');
        }
        // Successful so render
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books });
    });
};

// Handle Author delete on POST
exports.author_delete_post = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if(err) { return next(err); }
        // Success
        if(results.authors_books.length > 0) {
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to list of authors
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if(err) { return next(err); }
                // Success, go to author list
                res.redirect('/catalog/authors')
            })
        }
    });
};

// Display Author update form on GET
    exports.author_update_get = function(req, res, next) {
    // Get Book authors and genres for form
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
            if(err) { return next(err); }
            if(results.author==null) { // No results
                var err = new Error('Author not found');
                err.status = 404;
                return next(err);
            }
            // Success
            res.render('author_form', { title: 'Update Author', author: results.author } );
    });
};

// Handle Author update on POST
exports.author_update_post = [
    // Validate fields and sanitize
    validator.body('first_name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('First name must be specified.')
        .isAlphanumeric()
        .withMessage('First name has non-alphanumeric characters.')
        .escape(),

    validator.body('family_name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Family name must be specified.')
        .isAlphanumeric()
        .withMessage('Family name has non-alphanumeric characters.')
        .escape(),

    validator.body('date_of_birth', 'Invalid date of birth')
        .optional({ checkFalsy: true })
        .isISO8601()
        .escape(),

    validator.body('date_of_death', 'Invalid date of death')
        .optional({ checkFalsy: true })
        .isISO8601()
        .escape(),

    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validator.validationResult(req);

        if(!errors.isEmpty()){
            // There are errors. Render the form again with sanitized values/error messages
            res.render('author_form', { title: 'Update Author', author: req.body, errors: errors.array() });
            return;
        } 
        else {
            // Data form is valid
            // Create an Author object with escaped and trimmed data
            var author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death,
                    _id: req.params.id
                });
            Author.findByIdAndUpdate(req.params.id, author, {}, function(err, theauthor) {
                if(err) { return next(err); }
                //Successful, so redirect to new author record
                res.redirect(theauthor.url);
            });
        }
    }
];