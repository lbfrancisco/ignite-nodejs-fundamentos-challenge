import { randomUUID } from 'node:crypto';
import { Database } from './database/database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search } = request.query;

      const users = database.select('tasks', search ? {
        name: search,
        description: search,
      } : null);

      return response
        .setHeader('Content-Type', 'application/json')
        .end(JSON.stringify(users));
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;

      const task = database.find('tasks', id);

      if (!task) {
        return response.writeHead(400).end(JSON.stringify({ message: 'This id does not exists'}));
      }

      return response
        .setHeader('Content-Type', 'application/json')
        .end(JSON.stringify(task));
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { title, description } = request.body;

      if (!title || !description) {
        return response.writeHead(400).end('Title or description is missing.');
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      database.insert('tasks', task);

      return response.writeHead(201).end();
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { title, description } = request.body;
      const { id } = request.params;

      if (!title || !description) {
        return response.writeHead(400).end(JSON.stringify({ message: 'This id does not exists'}));
      }

      const task = database.find('tasks', id);

      if (!task) {
        return response.writeHead(400).end('This task id does not exists');
      }

      const updatedTask = {
        ...task,
        title: title ?? task.title,
        description: description ?? task.description,
        updated_at: Date.now(),
      }

      database.update('tasks', id, updatedTask);

      return response
        .setHeader('Content-Type', 'application/json')
        .end(JSON.stringify(updatedTask));
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params;

      const task = database.find('tasks', id);

      if (!task) {
        return response.writeHead(400).end(JSON.stringify({ message: 'This id does not exists'}));
      }

      const updatedTask = {
        ...task,
        completed_at: Date.now(),
      }

      database.update('tasks', id, updatedTask);

      return response
        .setHeader('Content-Type', 'application/json')
        .end(JSON.stringify(updatedTask));
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;

      const task = database.find('tasks', id);

      if (!task) {
        return response.writeHead(400).end(JSON.stringify({ message: 'This id does not exists'}));
      }

      database.delete('tasks', id);

      return response.writeHead(204).end();
    }
  }
];