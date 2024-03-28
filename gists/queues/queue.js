// const Queue = require("bull")
// const { mailProcess } = require("./p-mailer")

// // Our job queue
// const mailsQueue = new Queue("mails", {
//     redis: process.env.REDIS_URI,
// })

// mailsQueue.process(mailProcess)

// const createNewMail = (mail) => {
//     mailsQueue.add(mail, {
//         priority: getJobPriority(mail),
//         attempts: 2,
//     })
// }

// const priorities = {
//     'account activation': 10,
//     'listing deactivation': 3,
//     'listing activation': 3,
//     'new comment': 5,
//     'upload'
// }

// const getJobPriority = (mail) => {
//     const priority = priorities[mail.event]
//     return priority || 5
// }

// module.exports = {
//     mailsQueue,
//     createNewMail,
// }