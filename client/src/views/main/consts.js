// Configuration

export const isDevEnv = 'development' === process.env.NODE_ENV

export const consts = {
    APIHost: {
        production: 'https://classifieds-test.com',
        development: 'http://localhost:3003',
    },
    // { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4, "SILENT": 5};
    logLevel: {
        production: 1,
        development: 0,
    },
    tagSize: 35,
}
