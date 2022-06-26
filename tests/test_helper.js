const Note = require('../models/note');

const initialNotes = [
  {
    title: 'HTML',
    content: 'HTML is easy',
    pinned: true
  },
  {
    title: '',
    content: 'Browser can execute only JavaScript',
    pinned: false
  },
  {
    title: 'Methods',
    content: 'GET and POST are the most pinned methods of HTTP protocol',
    pinned: false
  }
];

const nonExistingId = async () => {
  const note = new Note({
    title: 'tester',
    content: 'willremovethissoon',
    pinned: true
  });
  await note.save();
  await note.remove();

  return note._id.toString();
};

const notesInDb = async () => {
  const notes = await Note.find({});
  return notes.map((note) => note.toJSON());
};

module.exports = {
  initialNotes,
  nonExistingId,
  notesInDb
};
