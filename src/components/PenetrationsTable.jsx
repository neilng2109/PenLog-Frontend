import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { formatDate } from '../utils/helpers'
import StatusBadge from './StatusBadge'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export default function PenetrationsTable({ data, onRowClick }) {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'pen_id',
        header: 'Pen #',
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'deck',
        header: 'Deck',
      },
      {
        accessorKey: 'fire_zone',
        header: 'Fire Zone',
      },
      {
        accessorKey: 'frame',
        header: 'Frame',
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => (
          <span className="max-w-xs truncate block">{getValue() || '—'}</span>
        ),
      },
      {
        accessorKey: 'pen_type',
        header: 'Type',
      },
      {
        accessorKey: 'contractor_name',
        header: 'Contractor',
      },
      {
        accessorKey: 'opened_at',
        header: 'Opened',
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        accessorKey: 'completed_at',
        header: 'Completed',
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        accessorKey: 'photo_count',
        header: 'Photos',
        cell: ({ getValue }) => {
          const count = getValue() || 0
          const colorClass = count === 0 
            ? 'bg-red-100 text-red-700 border-red-200' 
            : count === 1 
            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
            : 'bg-green-100 text-green-700 border-green-200'
          
          return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${colorClass}`}>
              📷 {count}
            </span>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUp className="w-4 h-4" />,
                        desc: <ChevronDown className="w-4 h-4" />,
                      }[header.column.getIsSorted()] ?? (
                        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row.original)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{' '}
          of {data.length} penetrations
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}