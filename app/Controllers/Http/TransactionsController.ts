import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Transaction from 'App/Models/Transaction'
import User from 'App/Models/User'

export default class TransactionsController {
  public async store({ request, response }: HttpContextContract) {
    const body = request.body()
    let debitedAccount = await User.find(body['debitedAccountId'])
    let creditedAccount = await User.findBy('email', body['creditedAccountEmail'])
    let transaction = new Transaction()
    if (debitedAccount && creditedAccount) {
      try {
        await debitedAccount.load('account')
        await creditedAccount.load('account')
        let value = parseFloat(body['value'])
        if (debitedAccount.account.balance < value) return response.status(500).send('no balance')
        if (debitedAccount.id == creditedAccount.id) return response.status(500).send('same e-mail')
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
      if (!creditedAccount) return response.status(500).send('invalid e-mail')
      return response.status(400).send('')
    }
    return response.ok({ transaction })
  }

  public async listByUserId({ request, response }: HttpContextContract) {
    const id = request.param('id')
    let transactions = await Transaction.query()
    let users = await User.query()
    let user = await User.find(id)
    if (user) {
      transactions = transactions.filter((a) => {
        return a.credited_account_id == user?.account_id || a.debited_account_id == user?.account_id
      })

      for (var i = 0; i < transactions.length; i++) {
        transactions[i].debited_user = this.getUser(transactions[i].debited_account_id, users)
        transactions[i].credited_user = this.getUser(transactions[i].credited_account_id, users)
      }
    } else {
      return response.status(400).send('')
    }
    console.log(transactions[0])

    return response.ok({ transactions })
  }
  getUser(id, users): User {
    let user = new User()
    users.forEach((element) => {
      if (element.account_id == id) user = element
    })

    return user
  }
}
