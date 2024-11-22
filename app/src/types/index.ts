export interface IUser {
  _id?: string
  name: string
  role?: string
  selected?: boolean
  splitValue?: number
}

export interface IExpense {
  _id: string
  group: string
  createdBy: string
  amount: number
  description: string
  category: string
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

export interface Auth0User {
  sub: string // Unique user ID
  email?: string // User's email
  name?: string // User's name
  picture?: string // User's profile picture
  [key: string]: any // Allow other optional claims or custom claims
}
