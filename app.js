const express = require('express');
const expressEjsLayouts = require('express-ejs-layouts');
const { loadContacts, findContact, addContact, cekDuplicat, deleteContact,updateContact } = require('./utils/contacts');
const { body, check, validationResult } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 3000;

app.set('view engine', 'ejs'); // set view engine
app.use(expressEjsLayouts); // Third=party middleware
app.use(express.static('public')); // Build-in middleware
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash message
app.use(cookieParser('secret'));
app.use(session({
  cookie: { maxAge: 6000 },
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());


// halaman home
app.get('/', (req, res) => {
  res.render('home', {
    layout: 'layouts/main',
    title: 'Home',
    url: req.url,
    name: 'Ilmi Faizan',
  });
});

// halaman about
app.get('/about', (req, res) => {
  res.render('about', {
    layout: 'layouts/main',
    title: 'About',
    url: req.url,
  });
});

// halaman semua contact
app.get('/contact', (req, res) => {
  const contacts = loadContacts();

  res.render('contact', {
    layout: 'layouts/main',
    title: 'Contact',
    url: req.url,
    contacts,
    msg: req.flash('msg'),
  });
});

// halaman tambah contact
app.get('/contact/add', (req, res) => {
  res.render('contact-add', {
    layout: 'layouts/main',
    title: 'Tambah Contact',
    url: req.url,
    contact: req.flash('contact'),
  });
});

// proses tambah contact
app.post('/contact/add', [
  body('noHp').custom((value) => {
    const duplikat = cekDuplicat(value);
    if (duplikat) throw new Error('No hp sudah terdaftar');
    return true;
  }),
  check('email', 'Email tidak valid').isEmail(),
  check('noHp', 'No handphone tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('contact', req.body);
      req.flash('errors', errors.array());

      res.render('contact-add', {
        layout: 'layouts/main',
        title: 'Tambah Contact',
        url: req.url,
        errors: req.flash('errors'),
        contact: req.flash('contact'),
      });
    } else {
      addContact(req.body);
      // kirim flash message
      req.flash('msg', 'Data contact berhasil ditambahkan');
      res.redirect('/contact');
    }
});

// halaman edit contact
app.get('/contact/edit/:id', (req, res) => {
  const contact = findContact(req.params.id);

  res.render('contact-edit', {
    layout: 'layouts/main',
    title: 'Edit Contact',
    url: req.url,
    contact,
  });
});

// proses update contact
app.post('/contact/edit/:id', [
  body('noHp').custom((value, { req }) => {
    const duplikat = cekDuplicat(value);
    const contact = findContact(req.params.id);

    if (value != contact.noHp && duplikat) throw new Error('No hp sudah terdaftar');
    return true;
  }),
  check('email', 'Email tidak valid').isEmail(),
  check('noHp', 'No handphone tidak valid').isMobilePhone('id-ID'),
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('contact', req.body);
      req.flash('errors', errors.array());

      res.render('contact-edit', {
        layout: 'layouts/main',
        title: 'Edit Contact',
        url: req.url,
        errors: req.flash('errors'),
        contact: req.body,
      });
    } else {
      // res.send(req.body);
      updateContact(req.body);
      // kirim flash message
      req.flash('msg', 'Data contact berhasil diupdate');
      res.redirect('/contact');
    }
  });

// proses hapus contact
app.get('/contact/delete/:id', (req, res) => {
  const contact = findContact(req.params.id);

  if (!contact) {
    res.status(404);
    res.send('<h2>Page not found</h2>');
  } else {
    deleteContact(req.params.id);
    req.flash('msg', 'Data contact berhasil dihapus');
    res.redirect('/contact');
  }
});

// halaman detail contact
app.get('/contact/:id', (req, res) => {
  const contact = findContact(req.params.id);

  res.render('contact-detail', {
    layout: 'layouts/main',
    title: 'Detail Contact',
    url: req.url,
    contact,
  });
});

// handle page not found
app.use((req, res) => {
  res.status(404);;
  res.send('<h2>Page not found</h2>');
});

app.listen(port, () => {
  console.log(`Server running in http://localhost:${port}`);
});