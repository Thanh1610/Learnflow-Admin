'use client';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import type { SVGProps } from 'react';
import React from 'react';

// Types
type DataRow = Record<string, unknown> & { id?: string | number };

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export interface Column {
  name: string;
  uid: string;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end'; // Maps to 'left' | 'center' | 'right' for TableCell
  width?: number;
  hidden?: boolean; // Hide column from visibility dropdown
  searchable?: boolean; // Whether this column can be searched (default: true for non-action columns)
}

export interface DataTableProps<T extends DataRow = DataRow> {
  columns: Column[];
  data: T[];
  initialVisibleColumns?: string[];
  searchPlaceholder?: string;
  emptyContent?: string;
  renderCell?: (item: T, columnKey: string) => React.ReactNode;
  renderActions?: (item: T) => React.ReactNode;
  onAddNew?: () => void;
  onRowClick?: (item: T) => void;
  onBulkDelete?: (selectedItems: T[]) => void;
  searchKeys?: string[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  getRowKey?: (item: T) => string | number;
  showCheckBox?: boolean;
  showSearch?: boolean;
}

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

const defaultGetRowKey = <T extends DataRow>(item: T): string | number => {
  if (typeof item.id === 'string' || typeof item.id === 'number') {
    return item.id;
  }
  return JSON.stringify(item);
};

export const PlusIcon = ({ size = 24, ...props }: IconProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || props.height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || props.width}
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M6 12h12" />
        <path d="M12 18V6" />
      </g>
    </svg>
  );
};

export const VerticalDotsIcon = ({ size = 24, ...props }: IconProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || props.height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || props.width}
      {...props}
    >
      <path
        d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
};

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};

export const TrashIcon = ({ size = 20, ...props }: IconProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || props.height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || props.width}
      {...props}
    >
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...otherProps}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export default function DataTable<T extends DataRow = DataRow>({
  columns,
  data,
  initialVisibleColumns,
  searchPlaceholder,
  emptyContent,
  renderCell: customRenderCell,
  renderActions,
  onAddNew,
  onBulkDelete,
  onRowClick,
  searchKeys = [],
  rowsPerPageOptions = [5, 10, 15],
  defaultRowsPerPage = 5,
  getRowKey = defaultGetRowKey,
  showCheckBox = true,
  showSearch = true,
}: DataTableProps<T>) {
  const tDataTable = useTranslations('DataTable');
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? tDataTable('searchPlaceholder');
  const resolvedEmptyContent = emptyContent ?? tDataTable('noItemsFound');
  const normalizedData = React.useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }
    console.warn(
      'DataTable received non-array data. Falling back to empty list.'
    );
    return [] as T[];
  }, [data]);
  // Auto-calculate initialVisibleColumns from columns if not provided
  const computedInitialVisibleColumns = React.useMemo(() => {
    if (initialVisibleColumns) return initialVisibleColumns;
    return columns.filter(col => !col.hidden).map(col => col.uid);
  }, [initialVisibleColumns, columns]);

  // Auto-calculate searchKeys from columns if not provided
  const computedSearchKeys = React.useMemo(() => {
    if (searchKeys.length > 0) return searchKeys;
    return columns
      .filter(col => col.uid !== 'actions' && col.searchable !== false)
      .map(col => col.uid);
  }, [searchKeys, columns]);

  const [filterValue, setFilterValue] = React.useState('');
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string> | 'all'>(
    new Set<string>([])
  );
  const [visibleColumns, setVisibleColumns] = React.useState<
    Set<string> | 'all'
  >(new Set(computedInitialVisibleColumns));
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: columns[0]?.uid || 'id',
    direction: 'ascending' as 'ascending' | 'descending',
  });
  const [page, setPage] = React.useState(1);
  const checkboxClickRef = React.useRef(false);

  const hasSearchFilter = Boolean(filterValue);

  // Track checkbox clicks globally
  React.useEffect(() => {
    if (!showCheckBox) {
      return undefined;
    }
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      checkboxClickRef.current = !!(
        target.closest('input[type="checkbox"]') ||
        target.closest('[role="checkbox"]') ||
        (target.tagName === 'INPUT' &&
          (target as HTMLInputElement).type === 'checkbox')
      );

      // Reset after a short delay
      setTimeout(() => {
        checkboxClickRef.current = false;
      }, 100);
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [showCheckBox]);

  const headerColumns = React.useMemo(() => {
    const visibleCols =
      visibleColumns === 'all'
        ? columns.filter(col => !col.hidden)
        : columns.filter(
            column =>
              !column.hidden &&
              visibleColumns instanceof Set &&
              Array.from(visibleColumns).includes(column.uid)
          );
    return visibleCols;
  }, [visibleColumns, columns]);

  const filteredItems = React.useMemo(() => {
    let filteredData = [...normalizedData];

    if (hasSearchFilter) {
      filteredData = filteredData.filter(item => {
        return computedSearchKeys.some(key => {
          const value = item[key];
          if (value === null || value === undefined) return false;
          return String(value)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      });
    }

    return filteredData;
  }, [computedSearchKeys, filterValue, hasSearchFilter, normalizedData]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const firstValue = a[sortDescriptor.column];
      const secondValue = b[sortDescriptor.column];

      const normalizedFirst =
        firstValue === null || firstValue === undefined
          ? ''
          : String(firstValue);
      const normalizedSecond =
        secondValue === null || secondValue === undefined
          ? ''
          : String(secondValue);

      const cmp =
        normalizedFirst < normalizedSecond
          ? -1
          : normalizedFirst > normalizedSecond
            ? 1
            : 0;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const defaultRenderCell = React.useCallback(
    (item: T, columnKey: string) => {
      const cellValue = item[columnKey];

      // Handle actions column
      if (columnKey === 'actions') {
        if (renderActions) {
          return renderActions(item);
        }
      }

      // Default: just render the cell value
      if (
        cellValue === null ||
        typeof cellValue === 'string' ||
        typeof cellValue === 'number' ||
        typeof cellValue === 'boolean'
      ) {
        return cellValue as React.ReactNode;
      }

      if (typeof cellValue === 'object') {
        return JSON.stringify(cellValue);
      }

      return null;
    },
    [renderActions]
  );

  const renderCell: (item: T, columnKey: string) => React.ReactNode =
    customRenderCell ?? defaultRenderCell;

  const selectedItems = React.useMemo(() => {
    if (selectedKeys === 'all') {
      return filteredItems;
    }
    if (selectedKeys instanceof Set) {
      return filteredItems.filter(item =>
        selectedKeys.has(String(getRowKey(item)))
      );
    }
    return [];
  }, [selectedKeys, filteredItems, getRowKey]);

  const handleBulkDelete = React.useCallback(() => {
    if (!onBulkDelete || selectedItems.length === 0) return;
    onBulkDelete(selectedItems);
    setSelectedKeys(new Set<string>());
  }, [onBulkDelete, selectedItems]);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          {showSearch && (
            <Input
              isClearable
              className="w-full sm:max-w-[44%]"
              placeholder={resolvedSearchPlaceholder}
              startContent={<SearchIcon />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          )}
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  {tDataTable('columns.title')}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={keys =>
                  setVisibleColumns(
                    keys === 'all' ? 'all' : (keys as Set<string>)
                  )
                }
              >
                {columns
                  .filter(col => !col.hidden)
                  .map(column => (
                    <DropdownItem key={column.uid} className="capitalize">
                      {capitalize(column.name)}
                    </DropdownItem>
                  ))}
              </DropdownMenu>
            </Dropdown>
            {onAddNew && (
              <Button
                color="primary"
                endContent={<PlusIcon />}
                onPress={onAddNew}
              >
                {tDataTable('addNew')}
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-default-400 text-small">
            {tDataTable('total')} {filteredItems.length} {tDataTable('items')}
          </span>
          <label className="text-default-400 text-small flex items-center">
            {tDataTable('rowsPerPage')}:
            <select
              className="text-default-400 text-small bg-transparent outline-transparent outline-solid"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              {rowsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    columns,
    filteredItems.length,
    filterValue,
    onAddNew,
    onClear,
    onRowsPerPageChange,
    onSearchChange,
    resolvedSearchPlaceholder,
    rowsPerPage,
    rowsPerPageOptions,
    showSearch,
    tDataTable,
    visibleColumns,
  ]);

  const bottomContent = React.useMemo(() => {
    const selectedCount = selectedKeys instanceof Set ? selectedKeys.size : 0;
    const totalCount = filteredItems.length;
    const isAllSelected =
      selectedKeys === 'all' ||
      (selectedKeys instanceof Set &&
        selectedKeys.size === filteredItems.length);

    const selectionText = isAllSelected
      ? tDataTable('allItemsSelected')
      : `${selectedCount} ${tDataTable('of')} ${totalCount} ${tDataTable('selected')}`;

    const hasSelection =
      selectedKeys === 'all' ||
      (selectedKeys instanceof Set && selectedKeys.size > 0);

    return (
      <div className="flex items-center justify-between px-2 py-2">
        <div className="text-small text-default-400 flex w-[30%] items-center gap-2">
          {showCheckBox && (
            <>
              <span>{selectionText}</span>
              {onBulkDelete && hasSelection && (
                <Button
                  aria-label={tDataTable('bulkDelete')}
                  color="danger"
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={handleBulkDelete}
                >
                  <TrashIcon />
                </Button>
              )}
            </>
          )}
        </div>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            {tDataTable('previous')}
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            {tDataTable('next')}
          </Button>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    filteredItems.length,
    page,
    pages,
    onPreviousPage,
    onNextPage,
    tDataTable,
    onBulkDelete,
    handleBulkDelete,
    showCheckBox,
  ]);

  return (
    <Table
      isHeaderSticky
      aria-label="Example table with custom cells, pagination and sorting"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px]',
      }}
      selectedKeys={showCheckBox ? selectedKeys : undefined}
      selectionMode={showCheckBox ? 'multiple' : undefined}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={
        showCheckBox
          ? keys => {
              // Chỉ cho phép selection nếu click từ checkbox
              if (checkboxClickRef.current) {
                setSelectedKeys(keys === 'all' ? 'all' : (keys as Set<string>));
              } else {
                // Giữ nguyên selection hiện tại nếu click không phải từ checkbox
                // Không làm gì cả
              }
            }
          : undefined
      }
      onSortChange={descriptor =>
        setSortDescriptor({
          column: String(descriptor.column),
          direction: descriptor.direction || 'ascending',
        })
      }
      onRowAction={
        onRowClick
          ? key => {
              // Chỉ gọi onRowClick nếu click không phải từ checkbox
              if (!checkboxClickRef.current) {
                const item = sortedItems.find(
                  item => String(getRowKey(item)) === String(key)
                );
                if (item) {
                  onRowClick(item);
                }
              }
            }
          : undefined
      }
    >
      <TableHeader columns={headerColumns}>
        {column => {
          const defaultAlign = column.uid === 'actions' ? 'center' : 'start';
          const tableAlign = column.align || defaultAlign;

          return (
            <TableColumn
              key={column.uid}
              align={tableAlign}
              allowsSorting={column.sortable}
              width={column.width}
            >
              {column.name}
            </TableColumn>
          );
        }}
      </TableHeader>
      <TableBody emptyContent={resolvedEmptyContent} items={sortedItems}>
        {item => (
          <TableRow key={getRowKey(item)}>
            {columnKey => {
              const column = headerColumns.find(col => col.uid === columnKey);
              const alignMap: Record<
                'start' | 'center' | 'end',
                'left' | 'center' | 'right'
              > = {
                start: 'left',
                center: 'center',
                end: 'right',
              };
              const defaultAlign = columnKey === 'actions' ? 'center' : 'start';
              const cellAlign = column?.align
                ? alignMap[column.align]
                : alignMap[defaultAlign];

              return (
                <TableCell align={cellAlign}>
                  {renderCell(item, String(columnKey))}
                </TableCell>
              );
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
