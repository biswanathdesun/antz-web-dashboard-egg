import React, { useState, forwardRef } from 'react'
import DatePicker from 'react-datepicker'

// ** MUI Imports

import {
  Grid,
  Radio,
  TextField,
  CardContent,
  FormControl,
  FormHelperText,
  FormControlLabel,
  Tooltip,
  Box
} from '@mui/material'

import { LoadingButton } from '@mui/lab'
import Router from 'next/router'
import { useRouter } from 'next/router'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import TableBasic from 'src/views/table/data-grid/TableBasic'
import Typography from '@mui/material/Typography'

import UserSnackbar from 'src/components/utility/snackbar'
import SingleDatePicker from 'src/components/SingleDatePicker'

import Utility from 'src/utility'
import { shipRequestedItems } from 'src/lib/api/pharmacy/getRequestItemsList'

// import { RadioGroup, FormLabel, FormControlLabel, Radio } from '@mui/material'

const defaultValues = {
  shipment_date: new Date().toISOString().slice(0, 10),
  person_shipping: null,
  delivery_mode: 'Shipped',
  vehicle_no: null,
  receiver_name: null,
  phone_number: null
}

const CustomInput = forwardRef(({ ...props }, ref) => {
  return <TextField fullWidth inputRef={ref} {...props} />
})

const ShipRequest = ({ dispatchedItems, storeDetails, close }) => {
  // ** Hooks
  const [statesList, setStatesList] = useState([])
  const [loader, setLoader] = useState(false)
  const [submitLoader, setSubmitLoader] = useState(false)

  const [deliveryType, setDeliveryType] = useState({
    pickUp: false,
    Ship: true
  })

  const [openSnackbar, setOpenSnackbar] = useState({
    open: false,
    severity: '',
    message: ''
  })
  const [date, setDate] = useState(new Date())

  const schema = deliveryType.Ship
    ? yup.object().shape({
        person_shipping: yup
          .string()
          .min(3, 'Person Shipping Info must be at least 3 characters')
          .required('Person Shipping Info is required'),
        shipment_date: yup.string().required('Shipment Date is required'),

        // vehicle_no: yup.string().required('Vehicle Number is required'),
        phone_number: yup
          .number()
          .required('Mobile Number is required')
          .test('is-valid-number', 'Mobile Number must be exactly 10 digits', value => {
            return /^\d{10}$/.test(value)
          })
      })
    : yup.object().shape({
        receiver_name: yup
          .string()
          .min(3, 'Person Receiving Info must be at least 3 characters')
          .required('Person Receiving  Info is required'),
        shipment_date: yup.string().required('Shipment Date is required'),
        phone_number: yup
          .number()
          .required('Mobile Number is required')
          .test('is-valid-number', 'Mobile Number must be exactly 10 digits', value => {
            return /^\d{10}$/.test(value)
          })
      })

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    shouldUnregister: false,
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  {
  }

  const router = useRouter()
  const { id, action } = router.query

  const shipRequest = async payload => {
    try {
      setSubmitLoader(true)

      const response = await shipRequestedItems(payload)
      if (response?.success) {
        setOpenSnackbar({ ...openSnackbar, open: true, message: response?.data, severity: 'success' })
        setSubmitLoader(false)
        reset(defaultValues)
        close()
      } else {
        setSubmitLoader(false)
        setOpenSnackbar({ ...openSnackbar, open: true, message: response?.message, severity: 'error' })
      }
    } catch (e) {
      setSubmitLoader(false)
      setOpenSnackbar({ ...openSnackbar, open: true, message: 'Error', severity: 'error' })
    }
  }

  // useEffect(() => {
  //   getStatesList()
  //   if (id != undefined && action === 'edit') {
  //     getSupplier(id)
  //   }
  // }, [id, action])

  const onSubmit = async params => {
    setSubmitLoader(true)

    const { person_shipping, vehicle_no, receiver_name, phone_number } = {
      ...params
    }

    const shipmentDate = Utility.formatDate(date)

    const payload = []

    dispatchedItems?.forEach((value, index) => {
      const payloadItem = {}
      payloadItem.dispatch_item_id = value.dispatch_item_id
      payloadItem.dispatch_id = value.dispatch_id
      payloadItem.shipment_date = shipmentDate
      payloadItem.person_shipping = person_shipping
      payloadItem.receiver_name = receiver_name
      payloadItem.status = deliveryType.Ship ? 'Shipped' : 'PickedUp'
      payloadItem.to_store_id = storeDetails.to_store_id
      payloadItem.from_store_id = storeDetails.from_store_id
      payloadItem.vehicle_no = vehicle_no
      payloadItem.phone_number = phone_number

      payload.push(payloadItem)
    })

    shipRequest(payload)
  }

  const CustomInput = forwardRef(({ ...props }, ref) => {
    return (
      <TextField
        inputRef={ref}
        {...props}
        sx={{ width: '100%' }}
        InputProps={{
          autoComplete: 'off'
        }}
      />
    )
  })

  const columns = [
    {
      flex: 0.05,
      Width: 40,
      field: 'id',
      headerName: 'Id',
      renderCell: (params, rowId) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.id}
        </Typography>
      )
    },
    {
      flex: 0.2,
      Width: 40,
      field: 'medicin_name',
      headerName: 'Product Name',
      renderCell: (params, rowId) => (
        <div>
          {/* <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.medicin_name}
          </Typography> */}
          <Tooltip title={params.row.medicin_name} placement='top'>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {params.row.medicin_name}
            </Typography>
          </Tooltip>
        </div>
      )
    },
    {
      flex: 0.2,
      minWidth: 20,
      field: 'from_store_name',
      headerName: 'Shipped from ',
      renderCell: params => (
        <div>
          <Tooltip title={params.row.from_store_name} placement='top'>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {params.row.from_store_name}
            </Typography>
          </Tooltip>
        </div>
      )
    },

    {
      flex: 0.2,
      minWidth: 20,
      field: 'to_store_name',
      headerName: 'Shipped to',
      renderCell: params => (
        <div>
          <Tooltip title={params.row.to_store_name} placement='top'>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {params.row.to_store_name}
            </Typography>
          </Tooltip>
        </div>
      )
    },
    {
      flex: 0.2,
      minWidth: 20,
      field: 'batch_no',
      headerName: 'Batch no',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.batch_no}
        </Typography>
      )
    },

    // {
    //   flex: 0.1,
    //   minWidth: 100,
    //   field: 'Package',
    //   headerName: 'Package',
    //   renderCell: params => (
    //     <Tooltip title={params?.row?.package} placement='top'>
    //       <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //         {params?.row?.package}
    //       </Typography>
    //     </Tooltip>
    //   )
    // },
    // {
    //   flex: 0.1,
    //   minWidth: 150,
    //   field: 'manufacture',
    //   headerName: 'Manufacturer',
    //   renderCell: params => (
    //     <Tooltip title={params?.row?.manufacture} placement='top'>
    //       <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //         {params?.row?.manufacture}
    //       </Typography>
    //     </Tooltip>
    //   )
    // },
    {
      flex: 0.2,
      minWidth: 20,
      field: 'expiry_date',
      headerName: 'Expiry date',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {Utility.formatDisplayDate(params.row.expiry_date) === 'Invalid date'
            ? 'NA'
            : Utility.formatDisplayDate(params.row.expiry_date)}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 20,
      field: 'dispatch_qty',
      headerName: 'Dispatch qty',
      type: 'number',
      align: 'right',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.dispatch_qty}
        </Typography>
      )
    }

    // {
    //   flex: 0.2,
    //   minWidth: 20,
    //   field: 'dispatch_status',
    //   headerName: 'Status',
    //   renderCell: params => (
    //     <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //       {params.row.dispatch_status}
    //     </Typography>
    //   )
    // }
  ]

  const handleDeliveryTypeChange = type => {
    if (type === 'Ship') {
      setDeliveryType({ ...deliveryType, Ship: true, pickUp: false })
      setValue('receiver_name', '')
      setValue('delivery_mode', 'Shipped')
    } else {
      setDeliveryType({ ...deliveryType, Ship: false, pickUp: true })
      setValue('vehicle_no', '')
      setValue('person_shipping', '')
      setValue('delivery_mode', 'PickedUp')
    }
  }

  return (
    <>
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12}>
          <CardContent>
            {dispatchedItems?.length > 0 ? (
              <Grid md={12} sm={12} xs={12} sx={{ mb: 14 }}>
                <TableBasic columns={columns} rows={dispatchedItems}></TableBasic>
              </Grid>
            ) : null}
            <Grid md={12} sm={12} xs={12} sx={{ my: 6 }}>
              <FormControlLabel
                value={deliveryType.Ship}
                label='Ship'
                control={
                  <Radio
                    onChange={() => {
                      handleDeliveryTypeChange('Ship')
                    }}
                    checked={deliveryType.Ship}
                    sx={deliveryType.Ship ? { color: 'error.main' } : null}
                  />
                }
              />
              <FormControlLabel
                value={deliveryType.pickUp}
                label='Pickup'
                control={
                  <Radio
                    onChange={() => {
                      handleDeliveryTypeChange('pickUp')
                    }}
                    checked={deliveryType.pickUp}
                    sx={deliveryType.pickUp ? { color: 'error.main' } : null}
                  />
                }
              />
            </Grid>
            <form onSubmit={!submitLoader ? handleSubmit(onSubmit) : null}>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SingleDatePicker
                      fullWidth
                      width={'100%'}
                      date={date}
                      value={date}
                      maxDate={new Date()}
                      name={'Shipment Date*'}
                      label='Shipment Date*'
                      placeholderText={'Shipment Date*'}
                      onChangeHandler={date => {
                        // console.log(date)
                        setDate(date)
                      }}
                      customInput={<CustomInput label='Shipment Date*' auto />}
                    />
                    {errors.shipment_date && (
                      <FormHelperText sx={{ color: 'error.main' }}>Shipment Date is required</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                {deliveryType.Ship ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='vehicle_no'
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange } }) => (
                            <TextField
                              value={value}
                              label='Vehicle Number'
                              onChange={onChange}
                              placeholder=''
                              error={Boolean(errors.vehicle_no)}
                              name='vehicle_no'
                            />
                          )}
                        />
                        {errors.vehicle_no && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.vehicle_no.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='person_shipping'
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange } }) => (
                            <TextField
                              value={value}
                              label='Person Shipping*'
                              onChange={onChange}
                              placeholder=''
                              error={Boolean(errors.person_shipping)}
                              name='person_shipping'
                            />
                          )}
                        />
                        {errors.person_shipping && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.person_shipping.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <Controller
                        name='receiver_name'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                          <TextField
                            value={value}
                            label='Receiver Name*'
                            onChange={onChange}
                            placeholder=''
                            error={Boolean(errors.receiver_name)}
                            name='receiver_name'
                          />
                        )}
                      />
                      {errors.receiver_name && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.receiver_name.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                )}

                {/* <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='delivery_mode'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          value={value}
                          label='Delivery Mode*'
                          onChange={onChange}
                          placeholder=''
                          error={Boolean(errors.delivery_mode)}
                          name='delivery_mode'
                        />
                      )}
                    />
                    {errors.delivery_mode && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.delivery_mode.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid> */}

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='phone_number'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          value={value}
                          label='Mobile number*'
                          onChange={onChange}
                          placeholder=''
                          error={Boolean(errors.phone_number)}
                          name='phone_number'
                        />
                      )}
                    />
                    {errors.phone_number && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.phone_number.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <LoadingButton size='large' type='submit' variant='contained' loading={submitLoader}>
                    Submit
                  </LoadingButton>
                  {openSnackbar.open ? (
                    <UserSnackbar severity={openSnackbar?.severity} status={true} message={openSnackbar?.message} />
                  ) : null}
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Grid>
      </Grid>
    </>
  )
}

export default ShipRequest
