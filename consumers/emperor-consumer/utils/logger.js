import winston from "winston"

const isProduction = process.env.NODE_ENV === "production"

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
}

const level = () => isProduction ? "http" : "debug"

const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true}),
    isProduction
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize({all: true}),
            winston.format.printf(
                (info) => {
                    const messageToPrint = info.stack || info.message
                    return `${info.timestamp} ${info.level}: ${messageToPrint}`
                }
            )
        )
)

export const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports: [
        new winston.transports.Console()
    ]
})