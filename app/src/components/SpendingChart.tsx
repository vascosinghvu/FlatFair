import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Transaction {
  timestamp: Date
  name: string
  group: string
  amount: number
  status: string
}

const SpendingChart = ({ transactions }: { transactions: Transaction[] }) => {
  // Aggregate spending data by month for the past 12 months
  const aggregateMonthlySpending = (transactions: Transaction[]) => {
    const monthlyData: { [key: string]: number } = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.timestamp)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
      monthlyData[monthYear] =
        (monthlyData[monthYear] || 0) + transaction.amount
    })

    // Convert object to array and sort by month
    const sortedMonthlyData = Object.entries(monthlyData)
      .map(([monthYear, total]) => ({ month: monthYear, total }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    return sortedMonthlyData
  }

  const spendingData = aggregateMonthlySpending(transactions)

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h3>User Spending in the Last 12 Months</h3>
      <ResponsiveContainer>
        <BarChart data={spendingData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SpendingChart
