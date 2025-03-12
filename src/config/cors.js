const corsOptions = {
    origin: ["http://localhost:3000"],


    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: true,

    maxAge: 86400,
}

module.exports = corsOptions

