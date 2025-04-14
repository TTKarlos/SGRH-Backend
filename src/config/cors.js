const corsOptions = {
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://sgrh.grupolasirena.dev"
    ],

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],

    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: true,

    maxAge: 86400,

}

module.exports = corsOptions
