// addState
// ** React Imports
import { useState, useEffect, useCallback, Fragment } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'
import { RadioGroup, FormLabel, Radio } from '@mui/material'
import { getUnitsById } from 'src/lib/api/pharmacy/getUnits'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { LoadingButton } from '@mui/lab'
import { useRouter } from 'next/router'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Components

const schema = yup.object().shape({
  unit_name: yup
    .string()
    .transform(value => (value ? value.trim() : value))
    .min(1, 'UOM must contain at least 1 characters')
    .required('UOM is Required'),
  active: yup.string().nullable()
})

const defaultValues = {
  unit_name: '',
  active: '1'
}

const AddUOM = props => {
  // ** Props
  const { addEventSidebarOpen, handleSidebarClose, handleSubmitData, resetForm, submitLoader, editParams } = props

  const {
    reset,
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    shouldUnregister: false,
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })

  const onSubmit = async params => {
    const { unit_name, active } = { ...params }

    const payload = {
      unit_name: unit_name.trim(),
      active
    }
    await handleSubmitData(payload)
  }

  const getUnits = useCallback(
    async id => {
      const response = await getUnitsById(id)
      console.log('add state comp', response)
      if (response?.success) {
        reset(response.data)
      } else {
      }
    },
    [reset]
  )

  useEffect(() => {
    if (resetForm) {
      reset(defaultValues)
    }

    if (editParams?.id !== null) {
      getUnits(editParams?.id)
    }
  }, [resetForm, editParams, reset, getUnits])

  const RenderSidebarFooter = () => {
    return (
      <Fragment>
        <LoadingButton size='large' type='submit' variant='contained' loading={submitLoader}>
          Add
        </LoadingButton>
      </Fragment>
    )
  }

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', 400] } }}
    >
      <Box
        className='sidebar-header'
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: 'background.default',
          p: theme => theme.spacing(3, 3.255, 3, 5.255)
        }}
      >
        <Typography variant='h6'>{editParams?.id !== null ? 'Edit' : 'Add'} UOM</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size='small' onClick={handleSidebarClose} sx={{ color: 'text.primary' }}>
            <Icon icon='mdi:close' fontSize={20} />
          </IconButton>
        </Box>
      </Box>
      <Box className='sidebar-body' sx={{ p: theme => theme.spacing(5, 6) }}>
        <form autoComplete='off' onSubmit={!submitLoader ? handleSubmit(onSubmit) : null}>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Controller
              name='unit_name'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  label='UOM Name*'
                  value={value}
                  onChange={onChange}
                  placeholder='UOM Name'
                  error={Boolean(errors.unit_name)}
                  name='unit_name'
                />
              )}
            />
            {errors.unit_name && (
              <FormHelperText sx={{ color: 'error.main' }}>{errors.unit_name.message}</FormHelperText>
            )}
          </FormControl>

          {editParams?.id !== null ? (
            <FormControl fullWidth sx={{ mb: 6 }} error={Boolean(errors.radio)}>
              <FormLabel>Status</FormLabel>
              <Controller
                name='active'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <RadioGroup row {...field} aria-label='gender' name='validation-basic-radio'>
                    <FormControlLabel
                      value='1'
                      label='Active'
                      sx={errors.active ? { color: 'error.main' } : null}
                      control={<Radio sx={errors.active ? { color: 'error.main' } : null} />}
                    />
                    <FormControlLabel
                      value='0'
                      label='Inactive'
                      sx={errors.active ? { color: 'error.main' } : null}
                      control={<Radio sx={errors.active ? { color: 'error.main' } : null} />}
                    />
                  </RadioGroup>
                )}
              />
              {errors.radio && (
                <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-radio'>
                  This field is required
                </FormHelperText>
              )}
            </FormControl>
          ) : null}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderSidebarFooter />
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default AddUOM
