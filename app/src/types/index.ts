export interface IUser {
  _id?: string
  name: string
  role?: string
  selected?: boolean
  splitValue?: number
}

export interface IExpense {
  _id: string
  group: IGroup
  createdBy: IUser
  amount: number
  description: string
  category: string
  statusMap: Map<string, string>
  status: string
  receipt: File
  date: Date
  allocatedTo: Map<IUser, number>
  allocatedToUsers: IUser[]
}

export interface IGroup {
  _id?: string
  groupName: string
  members: IUser[]
  expenses?: IExpense[]
}
