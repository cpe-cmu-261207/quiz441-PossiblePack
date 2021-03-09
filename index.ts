import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcrypt'
import { Sequelize, Model, DataTypes } from 'sequelize' 
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'
import { type } from 'node:os'


const app = express()
app.use(bodyParser.json())
app.use(cors())

const sequelize = new Sequelize('sqlite::memory:')
const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"

interface JWTPayload {
  username: string;
  password: string;
}

app.get('/', (req, res) => {
  res.json({ message: 'Hello world' })
})

interface User extends JWTPayload{
  firstname: string
  lastname: string
  balance: number
}
interface DbSchema {
  users: User[]
}

type LoginArgs = Pick<JWTPayload, 'username' | 'password' >

app.post<any, any, LoginArgs>('/login',
  async (req, res) => {

    const { username, password } = req.body
    // Use username and password to create token.
    const user = await User.findOne({ where: { username } })
    const userAttrs = user?.get()

  if (!userAttrs || !bcrypt.compareSync(password, userAttrs.password)) {
    res.status(400)
    res.json({ message: 'Invalid username or password' })
    return
  }

  const token = jwt.sign(
    {  username: userAttrs.username, password: userAttrs.password } as JWTPayload, 
    SECRET
  )
  res.json({ token })
})

app.get('/secret', (req, res) => {
  const token = req.headers.authorization
  if (!token) {
    res.status(401)
    res.json({ message: 'Require authorization header'})
    return
  }
  try {
    const data = jwt.verify(token.split(" ")[1], SECRET)
    res.json(data)
  } catch(e) {
    res.status(401)
    res.json({ message: e.message })
  }
})

app.listen(PORT, async () => {
  await sequelize.sync()
  console.log(`Server is running at ${PORT}`)
  })

  type RegisterArgs = Pick<User, 'username' | 'password' | 'firstname'| 'lastname' | 'balance' >

  app.post<any, any, RegisterArgs>('/register',
  (req, res) => {

    const { username, password, firstname, lastname, balance } = req.body
    const hashPassword = bcrypt.hashSync(password, 10)
    
    User.create({
      username,
      password: hashPassword,
      firstname,
      lastname,
      balance
    })
  })


app.get('/balance',
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
  
    }
    catch (e) {
      //response in case of invalid token
    }
  })

app.post('/deposit',
  body('amount').isInt({ min: 1 }),
  (req, res) => {

    //Is amount <= 0 ?
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ message: "Invalid data" })
  })

app.post('/withdraw',
  (req, res) => {
  })

app.delete('/reset', (req, res) => {

  //code your database reset here
  
  return res.status(200).json({
    message: 'Reset database successfully'
  })
})

app.get('/me', (req, res) => {
  
})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))