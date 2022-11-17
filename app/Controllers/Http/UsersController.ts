import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Account from 'App/Models/Account'
import User from 'App/Models/User'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    let createUserValidator = schema.create({
      password: schema.string({}, [rules.minLength(8)]),
      email: schema.string({}, [rules.email()]),
    })
    const userPayload = await request.validate({ schema: createUserValidator })
    const userByEmail = await User.findBy('email', userPayload.email)
    if (userByEmail) return response.status(409).send('email already in use')
    const user = new User()
    const acc = new Account()
    acc.balance = 100
    const newAcc = await acc.save()
    user.email = userPayload.email
    user.password = userPayload.password
    user.account_id = newAcc.id

    try {
      await user.save()
    } catch (e) {
      await newAcc.delete()
      return response.status(500).send('')
    }


    response.created({ user })
  }

  public async listById({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const user = await User.find(id)
    if (!user) return response.status(500).send('there is no user with that id')
    await user.load('account')
    return response.ok({ user })
  }
}
