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
      {/* Desktop Table View - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
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

      {/* Mobile Card View - only visible on mobile */}
      <div className="md:hidden divide-y divide-gray-200">
        {table.getRowModel().rows.map((row) => {
          const pen = row.original
          const photoCount = pen.photo_count || 0
          const photoColorClass = photoCount === 0 
            ? 'bg-red-100 text-red-700 border-red-200' 
            : photoCount === 1 
            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
            : 'bg-green-100 text-green-700 border-green-200'

          return (
            <div
              key={row.id}
              onClick={() => onRowClick(pen)}
              className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
            >
              {/* Header Row: Pen # and Status */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    Pen {pen.pen_id}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {pen.contractor_name}
                  </div>
                </div>
                <StatusBadge status={pen.status} />
              </div>

              {/* Location */}
              {pen.location && (
                <div className="text-sm font-medium text-gray-900 mb-2">
                  📍 {pen.location}
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Deck:</span>{' '}
                  <span className="font-medium text-gray-900">{pen.deck}</span>
                </div>
                <div>
                  <span className="text-gray-500">Fire Zone:</span>{' '}
                  <span className="font-medium text-gray-900">{pen.fire_zone}</span>
                </div>
                {pen.frame && (
                  <div>
                    <span className="text-gray-500">Frame:</span>{' '}
                    <span className="font-medium text-gray-900">{pen.frame}</span>
                  </div>
                )}
                {pen.pen_type && (
                  <div>
                    <span className="text-gray-500">Type:</span>{' '}
                    <span className="font-medium text-gray-900">{pen.pen_type}</span>
                  </div>
                )}
              </div>

              {/* Dates and Photos Row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-1 text-xs text-gray-600">
                  {pen.opened_at && (
                    <div>Opened: {formatDate(pen.opened_at)}</div>
                  )}
                  {pen.completed_at && (
                    <div>Completed: {formatDate(pen.completed_at)}</div>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${photoColorClass}`}>
                  📷 {photoCount}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
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