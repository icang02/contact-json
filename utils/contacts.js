const { dir } = require('console');
const fs = require('fs');

// membuat folder data jika belum ada
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
};

// membuat file contacts.json jika belum ada
const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8');
};

// ambil semua contact
const loadContacts = () => {
  const fileBuffer = fs.readFileSync('data/contacts.json', 'utf-8');
  const contacts = JSON.parse(fileBuffer);
  return contacts;
};

// cari contact berdasarkan id
const findContact = (id) => {
  const contacts = loadContacts();
  const contact = contacts.find((contact) => contact.id == id);
  return contact;
};

// menuliskan / menimpa file contacts.json dengan data yang baru
const saveContacts = (contacts) => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
};

// menambahkan data contact baru
const addContact = (contact) => {
  const contacts = loadContacts();

  if (contacts.length == 0) {
    contact['id'] = 1;
  } else {
    const id = contacts[contacts.length - 1].id + 1;
    contact['id'] = id;
  }

  // format text
  contact['nama'] = firstUpper(contact['nama']);
  contact['alamat'] = firstUpper(contact['alamat']);
  contact['kota'] = firstUpper(contact['kota']);

  contacts.push(contact);
  saveContacts(contacts);
};

// cek email duplikat
const cekDuplicat = (noHp) => {
  const contacts = loadContacts();
  return contacts.find((contact) => contact.noHp == noHp);
}

// hapus contact
const deleteContact = (id) => {
  const contacts = loadContacts();
  const filteredContacts = contacts.filter(contact => contact.id != id);
  saveContacts(filteredContacts);
};

const updateContact = (contactBaru) => {
  const contacts = loadContacts();
  
  contacts[contactBaru.id - 1 ]['nama']   = firstUpper(contactBaru.nama);
  contacts[contactBaru.id - 1 ]['noHp']   = contactBaru.noHp;
  contacts[contactBaru.id - 1 ]['email']  = contactBaru.email;
  contacts[contactBaru.id - 1 ]['alamat'] = firstUpper(contactBaru.alamat);
  contacts[contactBaru.id - 1 ]['kota']   = firstUpper(contactBaru.kota);

  saveContacts(contacts);
};

const firstUpper = (sentence) => {
  return sentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

module.exports = {
  loadContacts,
  findContact,
  addContact,
  cekDuplicat,
  deleteContact,
  updateContact,
}
