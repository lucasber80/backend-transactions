import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Account from './Account'
import User from './User'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public credited_account_id: number

  @column()
  public debited_account_id: number

  @column()
  public value: number

  @belongsTo(() => Account, {
    foreignKey: 'credited_account_id',
  })
  public creditedAccount: BelongsTo<typeof Account>

  @belongsTo(() => Account, {
    foreignKey: 'debited_account_id',
  })
  public debitedAccount: BelongsTo<typeof Account>
  @column()
  public debited_user: User

  @column()
  public credited_user: User

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
