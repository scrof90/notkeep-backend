const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({});
  response.status(200).json(notes);
});

notesRouter.get('/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

notesRouter.post('/', async (request, response) => {
  const note = new Note(request.body);

  const savedNote = await note.save();
  response.status(201).json(savedNote);
});

notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

notesRouter.put('/:id', async (request, response) => {
  const body = request.body;

  const note = {
    title: body.title,
    content: body.content,
    pinned: body.pinned
  };

  const updatedNote = await Note.findByIdAndUpdate(request.params.id, note, {
    new: true
  });
  response.json(updatedNote);
});

module.exports = notesRouter;
