import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function CompletionPieChart({ stats }) {
  const data = [
    { name: 'Verified', value: stats.verified || 0, color: '#10b981' },
    { name: 'Closed', value: stats.closed || 0, color: '#3b82f6' },
    { name: 'Pending', value: stats.closed || 0, color: '#f59e0b' },
    { name: 'Open', value: stats.open || 0, color: '#ef4444' },
    { name: 'Not Started', value: stats.not_started || 0, color: '#6b7280' },
  ].filter(item => item.value > 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}