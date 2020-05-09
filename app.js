const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const exphbs = require('express-handlebars');

// CONNECT TO DB
mongoose.connect('mongodb://localhost/nodeproj', {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;

// CHECK CONNECTION
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// CHECK FOR DB ERRORS
db.on('error', (err) => {
    console.log(err);
});

// INIT app
const app = express();

// GET Models
const Product = require('./models/Product');

// LOAD Template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// MIDDLEWARE - BODY PARSER
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());

//----------------------------------------------------------------

// ROUTE - HOME
app.get('/', (req, res) => {
    // RECEIVE DATA
    Product.find({}, (err, products)=>{
        res.render('index', {
            products: products.map(products => products.toJSON()),
            headTitle: 'Home'
        });
    });
});

// ROUTE - REDIRECT TO ADDPRODUCT PAGE
app.get('/products/add', (req, res) => {
    res.render('addproduct', {
        headTitle: 'Add Product'
    });
});

// ROUTE- VIEW SINGLE PRODUCT DATA
app.get('/products/:id', (req, res)=>{
    Product.findById(req.params.id, (err, product)=>{
        res.render('product', {
            headTitle: product.title,
            product: product.toJSON()
        });
    });
});

// ROUTE - ADD PRODUCT DATA AFTER SUBMIT
const {check, validationResult} = require('express-validator');
app.post('/products/add', [
    check('title', 'Title cannot be empty').not().isEmpty(),
    check('category', 'Category cannot be empty').not().isEmpty(),
    check('category.*', 'Fill in all category').exists({checkFalsy: true}),
    check('color', 'Color cannot be empty').not().isEmpty(),
    check('quantity', 'Enter acceptable quantity').not().isEmpty().isInt(),
    check('etc', 'Description cannot be empty').not().isEmpty()
],
(req, res) => {
    // Validate - Express validator
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('addproduct', {
            errors: errors.array(),
            headTitle: 'Add Product'
        });
    }else{
        // Get Post data
        let product = new Product();
        product.title = req.body.title;
        product.category = req.body.category;
        product.color = req.body.color;
        product.quantity = req.body.quantity;
        product.etc = req.body.etc;

        // Save Post data
        product.save((err)=>{
            if(err){
                console.log(err);
                return;
            }else{
                res.redirect('/');
            }
        });
    }
});

// ROUTE - EDIT SINGLE PRODUCT DATA
app.get('/products/edit/:id', (req, res)=>{
    Product.findById(req.params.id, (err, product)=>{
        res.render('editproduct', {
            headTitle: 'Edit Product',
            product: product.toJSON()
        });
    });
});

// ROUTE - UPDATE SINGLE PRODUCT DATA
app.post('/products/edit/:id', [
    check('title', 'Title cannot be empty').not().isEmpty(),
    check('category', 'Category cannot be empty').not().isEmpty(),
    check('category.*', 'Fill in all category').exists({checkFalsy: true}),
    check('color', 'Color cannot be empty').not().isEmpty(),
    check('quantity', 'Enter acceptable quantity').not().isEmpty().isInt(),
    check('etc', 'Description cannot be empty').not().isEmpty()
],(req, res)=>{
    // Validate - Express validator
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        Product.findById(req.params.id, (err, product)=>{
            res.render('editproduct', {
                errors: errors.array(),
                headTitle: 'Edit Product',
                product: product.toJSON()
            });
        });
    }else{
        // Get Post data
        let product = {};
        product.title = req.body.title;
        product.category = req.body.category;
        product.color = req.body.color;
        product.quantity = req.body.quantity;
        product.etc = req.body.etc;

        let query = {_id:req.params.id};

        // Save Post data
        Product.updateOne(query, product, (err)=>{
            if(err){
                console.log(err);
                return;
            }else{
                res.redirect('/');
            }
        });
    }
});

// ROUTE - DELETE SINGLE PRODUCT DATA
app.delete('/product/:id', (req, res)=>{
    let query = {_id: req.params.id};

    Product.deleteOne(query, (err)=>{
        if(err){
            console.log(err);
        }
        res.send('Success ');
    });
});

// ROUTE - SEARCH PRODUCT (query)
app.get('/search', (req, res)=>{
    // Create query with RegEx
    const {search} = req.query;
    const searchRegex = new RegExp(search, 'i');
    console.log(searchRegex);
    
    // Input RegEx query into database
    Product.find({title: searchRegex}, (err, products)=>{
        // Render data 
        res.render('searchproduct', {
            products: products.map(products => products.toJSON()),
            headTitle: 'Home'
        });
    });
});

// ROUTE - FILTER PRODUCT
app.get('/filter', (req, res)=>{
    const {select, search} = req.query;
    let query = {};
    const searchRegex = new RegExp(search, 'i');
    query[select] = searchRegex;
    console.log(query);

    Product.find(query, (err, products)=>{
        console.log(products);
        res.render('index', {
            products: products.map(products => products.toJSON()),
            headTitle: 'Home',
            search: search
        });
    });
});

// START SERVER
app.listen(3000, () => {
    console.log('Server started on port 3000');
});