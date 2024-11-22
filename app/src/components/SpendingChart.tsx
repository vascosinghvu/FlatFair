import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { IExpense } from "../types"

const SpendingChart = ({ transactions }: { transactions: IExpense[] }) => {
  // Aggregate spending data by month
  const aggregateMonthlySpending = (expenses: IExpense[]) => {
    // Initialize an object with all months set to 0
    const monthlyData: { [key: string]: number } = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    }

    expenses.forEach((expense) => {
      const date = new Date(expense.date) // Parse date
      const month = date.toLocaleString("default", { month: "short" }) // Get month abbreviation (e.g., "Jan")
      monthlyData[month] += expense.amount
    })

    // Convert object to an array for the chart
    const chartData = Object.entries(monthlyData).map(([month, total]) => ({
      month,
      total,
    }))

    return chartData
  }

  const spendingData = aggregateMonthlySpending(transactions)

  return (
    <div style={{ width: "100%", height: 200 }}>
      <h3>User Spending by Month</h3>
      <ResponsiveContainer>
        <LineChart data={spendingData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#415458" />
          <XAxis dataKey="month" stroke="#415458" />
          <YAxis stroke="#415458" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#A58CEE"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SpendingChart
