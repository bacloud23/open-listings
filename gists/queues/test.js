const { mailsQueue, createNewMail } = require('./queue')

await createNewMail({ to: 'user1', event: 'account activation' })
await createNewMail({ to: 'user1', event: 'listing deactivation' })
await createNewMail({ to: 'user1', event: 'listing activation' })
await createNewMail({ to: 'user1', event: 'new comment' })