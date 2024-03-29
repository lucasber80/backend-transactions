import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SessionsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const { email, password } = request.only(['email', 'password'])

    const token = await auth.use('api').attempt(email, password, {
      expiresIn: '24hours',
    })

    const user = auth.user

    await user?.load('account')

    return response.created({ user, token })
  }

  public async destroy({ response, auth }: HttpContextContract) {
    await auth.logout()
    return response.ok({})
  }
}
