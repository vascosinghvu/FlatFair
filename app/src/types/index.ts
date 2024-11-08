export interface IUser {
    _id?: string;
    name: string;
    role?: string;
    selected?: boolean;
    splitValue?: number;
}

export interface IExpense {
    _id?: string;
    description: string;
    amount: number;
    date: Date;
    status: string;
    createdBy: IUser;
}

export interface IGroup {
    _id?: string;
    groupName: string;
    members: IUser[];
    expenses?: IExpense[];
}