import { Box, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  label: string
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
}

interface ListToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
}

/**
 * Shared search + filter bar for list pages.
 * Place directly above the list/grid content.
 */
export default function ListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters = [],
}: ListToolbarProps) {
  return (
    <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flexGrow: 1, minWidth: 220 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />
      {filters.map((filter) => (
        <FormControl key={filter.label} size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{filter.label}</InputLabel>
          <Select label={filter.label} value={filter.value} onChange={(e) => filter.onChange(e.target.value)}>
            {filter.options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </Box>
  )
}
