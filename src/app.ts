import express from 'express'
const app = express()

app.get('/', (req, res) => {
  res.send('Hello jon!')
})

export default app