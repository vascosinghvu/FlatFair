export interface IUser {
  _id?: string
  name: string
  role?: string
  selected?: boolean
  splitValue?: number
}

export interface IExpense {
  _id?: string
  description: string
  amount: number
  date: Date
  status: string
  createdBy: IUser
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
