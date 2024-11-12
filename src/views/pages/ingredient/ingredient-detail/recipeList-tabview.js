import React, { useState, useEffect, useCallback } from 'react'

import { getRecipeListonIngredientDtl } from 'src/lib/api/diet/getIngredients'

import FallbackSpinner from 'src/@core/components/spinner/index'
import { DataGrid } from '@mui/x-data-grid'
import { debounce } from 'lodash'
import Tab from '@mui/material/Tab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import { Avatar, Box, CardContent } from '@mui/material'

// ** MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import ServerSideToolbar from 'src/views/table/data-grid/ServerSideToolbar'
import SwapIngredient from './swapIngredient'

const RecipeListTabview = ({ IngredientName, onTotalChange }) => {
  const [loader, setLoader] = useState(false)
  const router = useRouter()
  const { id } = router.query
  const [total, setTotal] = useState(0)
  const [rows, setRows] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [sortColumning, setsortColumning] = useState('recipe_name')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [status, setStatus] = useState('1')
  const [showSwapBtn, setshowSwapBtn] = useState([])
  const [activitySidebarOpen, setActivitySidebarOpen] = useState(false)
  const [searchSwapIngredientValue, setSearchSwapIngredientValue] = useState('')

  const handleSidebarClose = () => {
    setActivitySidebarOpen(false)
  }

  function loadServerRows(currentPage, data) {
    return data
  }

  const handleChange = (event, newValue) => {
    setTotal(0)
    setStatus(newValue)
  }

  const fetchTableData = useCallback(
    async (q, searchColumns, status) => {
      try {
        setLoading(true)

        const params = {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          q,
          searchColumns,
          status
        }
        await getRecipeListonIngredientDtl(id, params).then(res => {
          console.log('response', res)
          setTotal(parseInt(res?.data?.data?.count))

          const result = res?.data?.data?.result

          if (Array.isArray(result)) {
            // If result is an array, update rows directly
            setRows(loadServerRows(paginationModel.page, result))
          } else if (typeof result === 'object') {
            // If result is an object, convert it to an array of one object
            setRows([result])
          } else {
            // Handle other cases
            console.error('Unexpected result type:', result)
          }
        })
        setLoading(false)
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    },
    [paginationModel]
  )
  useEffect(() => {
    fetchTableData(searchValue, sortColumning, status)
  }, [fetchTableData, status])
  useEffect(() => {
    onTotalChange(total)
  }, [total, onTotalChange])

  const getSlNo = index => (paginationModel.page + 1 - 1) * paginationModel.pageSize + index + 1

  const indexedRows = rows?.map((row, index) => ({
    ...row,
    sl_no: getSlNo(index)
  }))

  const searchTableData = useCallback(
    debounce(async (q, searchColumns, status) => {
      setSearchValue(q)
      try {
        await fetchTableData(q, searchColumns, status)
      } catch (error) {
        console.error(error)
      }
    }, 1000),
    []
  )

  const handleSelectionChange = newSelection => {
    console.log('Selection changed:', newSelection)
    const selectedRowsData = newSelection.map(id => rows.find(row => row.id === id))
    console.log('Selected rows:', selectedRowsData)
    if (selectedRowsData.length > 0) {
      setshowSwapBtn(selectedRowsData)
    } else {
      setshowSwapBtn([])

      //selectedRowsData = []
    }
  }

  const handleSearch = value => {
    setSearchValue(value)
    searchTableData(value, sortColumning, status)
  }

  const columns = [
    {
      flex: 0.5,
      minWidth: 40,
      field: 'recipe_name',
      headerName: 'RECIPE',
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* {renderClient(params)} */}
          <Avatar
            variant='square'
            alt='Recipe Image'
            sx={{ width: 40, height: 40, mr: 4, background: '#E8F4F2', padding: '8px', borderRadius: '4px' }}
            src={params.row.recipe_image ? params.row.recipe_image : '/icons/icon_ingredient_fill.png'}
          >
            {params.row.recipe_image ? null : <Icon icon='healthicons:fruits-outline' />}
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='body2' sx={{ color: 'text.primary' }}>
              {params.row.recipe_name ? params.row.recipe_name : '-'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.3,
      minWidth: 10,
      field: 'kcal',
      headerName: 'KCAL',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary', pl: 3 }}>
          {params.row.kcal ? params.row.kcal + ' ' + 'Kcal' : '-'}
        </Typography>
      )
    },
    {
      flex: 0.3,
      minWidth: 10,
      field: 'ingredient_count',
      headerName: 'NO OF INGREDIENTS',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary', pl: 3 }}>
          {params.row.ingredient_count ? params.row.ingredient_count : '-'}
        </Typography>
      )
    }
  ]

  const TabBadge = ({ label, totalCount }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
      {label}
      {totalCount ? (
        <Chip sx={{ ml: '6px', fontSize: '12px' }} size='small' label={totalCount} color='secondary' />
      ) : null}
    </div>
  )

  const tableData = () => {
    return (
      <>
        {loader ? (
          <FallbackSpinner />
        ) : (
          <>
            <div>
              {/* {showSwapBtn.length > 0 ? ( */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div></div>
                {/* <Button
                  size='small'
                  variant='contained'
                  onClick={() => setActivitySidebarOpen(true)}
                  sx={{ px: 4, py: 2, cursor: 'pointer', position: 'relative', top: 8 }}
                >
                  <Icon icon='mdi:add' fontSize={20} />
                  &nbsp; SWAP {IngredientName}
                </Button> */}
                <Box sx={{ px: 4, py: 4, cursor: 'pointer', position: 'relative', top: 8 }}></Box>
                {/* /////////////// */}
                <Drawer
                  anchor='right'
                  open={activitySidebarOpen}
                  ModalProps={{ keepMounted: true }}
                  sx={{ '& .MuiDrawer-paper': { width: ['100%', 500] }, height: '100vh' }}
                >
                  <CardContent>
                    <SwapIngredient
                      handleSidebarClose={handleSidebarClose}
                      setActivitySidebarOpen={setActivitySidebarOpen}
                    />
                  </CardContent>
                </Drawer>
                {/* //////////////////// */}
              </div>
              {/* ) : (
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '38px' }}
                ></div>
              )} */}
              <DataGrid
                sx={{
                  '.MuiDataGrid-cell:focus': {
                    outline: 'none'
                  },

                  '& .MuiDataGrid-row:hover': {
                    cursor: 'pointer'
                  }
                }}
                columnVisibilityModel={{
                  sl_no: false
                }}
                hideFooterSelectedRowCount
                disableColumnSelector={true}
                checkboxSelection={false}
                disableColumnMenu={true}
                onRowSelectionModelChange={handleSelectionChange}
                selectionModel={selectedRows}
                autoHeight
                pagination
                rows={indexedRows === undefined ? [] : indexedRows}
                rowCount={total}
                columns={columns}
                paginationMode='server'
                pageSizeOptions={[7, 10, 25, 50]}
                paginationModel={paginationModel}
                slots={{ toolbar: ServerSideToolbar }}
                onPaginationModelChange={setPaginationModel}
                loading={loading}
                slotProps={{
                  baseButton: {
                    variant: 'outlined'
                  },
                  toolbar: {
                    value: searchValue,
                    clearSearch: () => handleSearch(''),
                    onChange: event => handleSearch(event.target.value),
                    tableValue: 'recipe-List'
                  }
                }}
              />
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TabContext value={status}>
            <TabList onChange={handleChange}>
              {/* <Tab value='all' label={<TabBadge label='All' totalCount={status === 'all' ? total : null} />} /> */}
              <Tab value='1' label={<TabBadge label='Active' totalCount={status === '1' ? total : null} />} />
              <Tab value='0' label={<TabBadge label='Inactive' totalCount={status === '0' ? total : null} />} />
              {/* <Tab
              value='disputed'
              label={<TabBadge label='Disputes' totalCount={status === 'disputed' ? total : null} />}
            /> */}
            </TabList>
            {/* <TabPanel value='all'>{tableData()}</TabPanel> */}
            <TabPanel value='1'>{tableData()}</TabPanel>
            <TabPanel value='0'>{tableData()}</TabPanel>
            {/* <TabPanel value='disputed'>{tableData()}</TabPanel> */}
          </TabContext>
        </Grid>
      </Grid>
    </>
  )
}

export default RecipeListTabview
