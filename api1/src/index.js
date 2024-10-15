const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const helmet = require('helmet')
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const port = process.env.PORT || 4000;
//const DB_HOST = process.env.DB_HOST;

const app = express();
mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.zizla.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.MONGO_DB}`).then(()=>{app.listen(4000);}).catch((err)=>{console.log(err);})
app.use(helmet());

app.use(cors());

//db.connect(DB_HOST);
const getUser = token => {
if (token) {
    try {
    return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
    throw new Error('Session invalid');
    }
}
};

const server = new ApolloServer({
typeDefs,
resolvers,
context: ({ req }) => {
    const token = req.headers.authorization;
    const user = getUser(token);
    console.log(user);
    return { models, user };
}
});

server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
)
);
