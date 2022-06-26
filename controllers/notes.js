const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({});
  response.status(200).json(notes);
});

notesRouter.get('/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((Note) => {
      if (Note) {
        response.json(Note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

notesRouter.post('/', async (request, response) => {
  const Note = new Note(request.body);

  const savedNote = await Note.save();
  response.status(201).json(savedNote);
});

notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

notesRouter.put('/:id', async (request, response) => {
  const body = request.body;

  const Note = {
    title: body.title,
    content: body.content,
    pinned: body.pinned
  };

  const updatedNote = await Note.findByIdAndUpdate(request.params.id, Note, {
    new: true
  });
  response.json(updatedNote);
});

module.exports = notesRouter;
