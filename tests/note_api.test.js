const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

const Note = require('../models/note');
const helper = require('./test_helper');

jest.setTimeout(100000);

beforeEach(async () => {
  await Note.deleteMany({});
  await Note.insertMany(helper.initialNotes);
});

describe('when there is initially some Notes saved', () => {
  test('correct amount of Notes are returned as json', async () => {
    const response = await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(helper.initialNotes.length);
  });

  test('the unique identifier property of the Notes is named id', async () => {
    const response = await api.get('/api/notes');

    expect(response.body[0].id).toBeDefined();
  });
});

describe('addition of a new Note', () => {
  test('a valid Note can be added ', async () => {
    const newNote = {
      title: 'test Note for testing',
      author: 'tester',
      pinned: false
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);
  });

  test('if the title property is missing from the request, it will default to the value of an empty string', async () => {
    const newNote = {
      content: 'test Note for testing',
      pinned: false
    };

    const request = await api.post('/api/notes').send(newNote);
    expect(request.body.likes).toBe(0);
  });

  test('if the pinned property is missing from the request, it will default to the value false', async () => {
    const newNote = {
      title: 'test Note for testing',
      author: 'tester'
    };

    const request = await api.post('/api/notes').send(newNote);
    expect(request.body.likes).toBe(0);
  });

  test('if content property is missing, the backend responds with status code 400 Bad Request', async () => {
    const newNote = {
      title: 'tester',
      pinned: false
    };

    await api.post('/api/notes').send(newNote).expect(400);
  });
});

describe('deletion of a Note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

    const titles = notesAtEnd.map((r) => r.title);

    expect(titles).not.toContain(noteToDelete.content);
  });
});

describe('updating of a Note', () => {
  const updatedNote = {
    title: 'Golden Troll',
    author: 'O.S. Leshev',
    pinned: 'http://golden.troll',
    likes: 0
  };

  test('succeeds with status code 200 OK if id is valid', async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToUpdate = notesAtStart[0];

    const response = await api
      .put(`/api/notes/${noteToUpdate.id}`)
      .send(updatedNote)
      .expect(200);

    expect(response.body.title).toBe(noteToUpdate.title);
    expect(response.body.likes).toBe(updatedNote.likes);
  });

  test('succeeds with status code 200 OK and does not change the db if id is valid but is not in the db', async () => {
    const validNonexistingId = await helper.nonExistingId();

    await api
      .put(`/api/notes/${validNonexistingId}`)
      .send(updatedNote)
      .expect(200);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3y7bb59070281a82a3445';

    await api.put(`/api/notes/${invalidId}`).send(updatedNote).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
