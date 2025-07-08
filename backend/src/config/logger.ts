import { Config } from "./index";
import winston from "winston";




export const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
        serviceName: 'user-service'
    },
    transports: [
        new winston.transports.File({
            dirname: 'logs',
            filename: 'combine.log',
            level: 'debug',
            silent: Config.NODE_ENV === 'test',
        }),
        new winston.transports.File({
            dirname: 'logs',
            filename: 'error.log',
            level: 'error',
            silent: Config.NODE_ENV === 'test',
        }),
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
})