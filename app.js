const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const {body, validationResult, check} = require('express-validator')
const methodOverride = require('method-override')

require('./utils/db')
const Contact = require('./model/contact')

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');


const app = express();
const port = 3000;

app.use(methodOverride('_method'))

//setup ejs 
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));



//konfigurasi flash 
app.use(cookieParser('secret'))
app.use(session({
  cookie: {maxAge:6000},
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))


app.use(flash());


app.get('/', (req, res) => {
  

    res.render('index', {
      nama: 'Samuel William',
      layout: 'layouts/main_layout'
      
    });
  
  
  })

  app.get('/about', async(req, res) => {
    res.render('about',{
      layout: 'layouts/main_layout',
      title: 'Halaman About'})
  
  })

  app.get ('/contact', async(req, res) => {
    const contacts = await Contact.find();
  
    
    res.render('contact',
    { layout: 'layouts/main_layout',
    title: 'Halaman Contanct',
    contacts: contacts,
    msg: req.flash('msg'),
    })
  
  })

  app.get('/contact/add',(req,res)=>{

    res.render('add-contact',{
      title: 'Form tambah data',
      layout:'layouts/main_layout'
    })
  })
  

  //proses data kontak 
app.post('/contact',

[
body('nama').custom(async(value)=>{
  const duplikat = await Contact.findOne({nama: value});
  if(duplikat){
    throw new Error('Nama sudah digunakan');
  }
  return true;
}),

check('email','Email tidak Valid').isEmail(),
check('nohp','No HP tidak valid').isMobilePhone('id-ID')], 

(req,res)=>{

  const errors = validationResult(req);
  if(!errors.isEmpty()){
  

    res.render('add-contact',{

      title:'Form Tambah Data',
      layout:'layouts/main_layout',
      errors: errors.array(),
    });
  }else{
    Contact.insertMany(req.body, (error,result)=>{
      
      req.flash('msg','Berhasil Ditambahkan!');
      res.redirect('/contact')
    })

    //flash message
    
  }
  
})

app.delete('/contact',(req,res)=>{
  Contact.deleteOne({nama: req.body.nama}).then((result)=>{
  req.flash('msg','Berhasil Dihapus!');
  res.redirect('/contact')
  });
 
})

app.get('/contact/edit/:nama',async(req,res)=>{
  const contact = await Contact.findOne({nama: req.params.nama})
  res.render('edit-contact',{
    title: 'Form ubah data',
    layout:'layouts/main_layout',
    contact,
  })
})

app.put('/contact',

  [
  body('nama').custom(async (value,{req})=>{
    const duplikat = await Contact.findOne({nama:value});
    if(value!== req.body.oldNama && duplikat){
      throw new Error('Nama sudah digunakan');
    }
    return true;
  }),

  check('email','Email tidak Valid').isEmail(),
  check('nohp','No HP tidak valid').isMobilePhone('id-ID')], 
  
  (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      // return res.status(400).json({errors: errors.array()})

      res.render('edit-contact',{

        title:'Form Ubah Data',
        layout:'layouts/main_layout',
        errors: errors.array(),
        contact: req.body
      });
    }else{


      Contact.updateOne(
        {_id: req.body._id},
        {
          $set:{
            nama: req.body.nama,
            email:req.body.email,
            nohp: req.body.nohp,
          }
        })
      .then((result)=>{
        
        req.flash('msg','Berhasil Diubah!');
        res.redirect('/contact')
        
      })  
      //flash message
    }
    

})




  app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({nama: req.params.nama});
    
  
    res.render('detail',{ 
    
      layout: 'layouts/main_layout',
    title: 'Halaman Detail Contact',
    contact})
  
  })


app.listen(port, ()=>{
    console.log(`listening at http://localhost:${port}`)
})
