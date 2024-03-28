import nodemailer from 'nodemailer'
import { config } from '../../utils.js'

/**
 * @class
 * Actual Mailer class. <br>
 * Note: not active when using NeDB in development mode. Because it relies on MongoDB.
 * ~It uses 'mail-time' library~
 * @constructor
 * @public
 */
class MailerOps {
    constructor() {
        let transports = []
        const transport = nodemailer.createTransport(config('SMTP'))

        transports.push(transport)

        /**
         * Send an email with user defined language !
         *
         * @typedef {Object}
         * @property {String} to an email to send email to
         * @property {String} [subject] optional email subject
         * @property {String} [text] optional email text
         * @property {String} [html] optional email html
         * @public
         */
        this.sendMail = function ({ html, subject, text, to }) {
            if (!transport) return

            transport.sendMail({ from: config('SMTP').from, html, subject, text, to }, function (error, info) {
                if (error) {
                    console.log(error)
                } else {
                    console.log('Email sent: ' + info.response)
                }
            })
        }

        /**
         * Send an email with user defined language !
         * 'subject', 'text', 'html' are derived from 'request' object
         *
         * @typedef {Object}
         * @property {String} to an email to send email to
         * @property {String} [todo] the action the doer is performing
         * @property {import('fastify').FastifyRequest} [req] request object to derive i18next translations
         * @property {Object} [data] key-values to inject to i18next} param0
         * @public
         */
        this.sendCustomMail = function ({ data, req, to, todo }) {
            if (!transport) return
            // If req is provided we assume here that
            // a multilingual version exists and data is provided
            let subject, text, html
            if (req) {
                subject = req.t(`mail.${todo}.subject`, data)
                text = req.t(`mail.${todo}.text`, data)
                html = req.t(`mail.${todo}.html`, data)
                // req.log.info(`subject ${subject}`)
            }
            transport.sendMail({ from: config('SMTP').from, html, subject, text, to }, function (error, info) {
                if (error) {
                    console.log(error)
                } else {
                    console.log('Email sent: ' + info.response)
                }
            })
        }
    }
}

/**
 * @class
 * Factory class of 'MailerOps'. <br>
 * It instantiates a singleton with '#getInstance()'
 * @public
 */
class Mailer {
    constructor() {
        throw new Error('Use Mailer.getInstance()')
    }
    /**
     * Singleton Mailer instance
     * @returns { Promise <MailerOps> }
     */
    static async getInstance() {
        if (!Mailer.instance) {
            Mailer.instance = new MailerOps()
        }
        return Mailer.instance
    }
}

Mailer.instance = undefined
export default Mailer
