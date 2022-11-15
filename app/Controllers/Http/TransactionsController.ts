import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Transaction from 'App/Models/Transaction'
import User from 'App/Models/User'

export default class TransactionsController {
  public async store({ request, response }: HttpContextContract) {
    const body = request.body()
    let debitedAccount = await User.find(body['debitedAccountId'])
    let creditedAccount = await User.find(body['creditedAccountId'])
    let transaction = new Transaction()
    if (debitedAccount && creditedAccount) {
      try {
        await debitedAccount.load('account')
        await creditedAccount.load('account')
        let value = parseFloat(body['value'])
        debitedAccount.account.balance -= value
        creditedAccount.account.balance += value
        await debitedAccount.account.save()
        await creditedAccount.account.save()
        transaction.value = value
        transaction.credited_account_id = creditedAccount.account.id
        transaction.debited_account_id = debitedAccount.account.id
        await transaction.save()
      } catch (e) {
        return response.status(400).send('')
      }
    } else {
      return response.status(400).send('')
    }
    return response.ok({ transaction })
  }

  public async listByUserId({ request, response }: HttpContextContract) {
    const id = request.param('id')
    let transactions = await Transaction.query()
    let user = await User.find(id)
    if (user) {
      transactions = transactions.filter((a) => {
        return a.credited_account_id == user?.account_id
      })
    } else {
      return response.status(400).send('')
    }

    return response.ok({ transactions })
  }
}
