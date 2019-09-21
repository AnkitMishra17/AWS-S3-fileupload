const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const viewsPath = path.join(__dirname, "/views");

//Database
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'opdemy'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('Connection Established');
});

aws.config.update({
    secretAccessKey: '',
    accessKeyId: '',
    region: 'us-east-2'
})
const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'file-uploads12',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'testing...'});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString()+'.pdf')
    }
  })
})

const singleUpload = upload.single('file');

app.set('view engine', 'ejs')
app.set("views", viewsPath)

app.use('/public',express.static(path.join(__dirname, "../public")));

app.get('/', (req,res) =>{
          res.render('index');
});

app.post('/',(req,res) =>{
    singleUpload(req, res ,function(err){
      let url = req.file.location;
      console.log(url);
      const sql = "INSERT INTO pdf_url (url) VALUES ('"+ url +"')";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        res.redirect('/');
      });
  });


});


const server = app.listen(port, (req, res) => {
    console.log(`Server started at port ${port}..`)
  });
