import Fastify from 'fastify'

import process from "process";
import lyricAPI from './API/lyricAPI.js';



const fastify = Fastify({
    logger: true
  })

let startUpTime = null;

// Declare a route
fastify.get('/', async function (request, reply) {
    const query = request.query;
    if (JSON.stringify(query) !== '{}') {
      const song = await lyricAPI(query.lyrics)
      reply.send({ hello: song })
    }
  })
  
  // Run the server!
  fastify.listen({ port: 4400 }, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }

    console.log('Ready.');
    startUpTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    console.log(`Server Start: ${startUpTime}`);
    // Server is now listening on ${address}
  });