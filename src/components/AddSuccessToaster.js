import React from 'react'
import toast from 'react-hot-toast'
import { Typography, Box, Divider } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'

const AddToasterforSuccess = ({ type, id, t }) => {
  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Icon icon='ooui:success' style={{ marginRight: '20px', fontSize: 50, color: '#37BD69' }} />
        <div>
          <Typography sx={{ fontWeight: 500 }} variant='h5'>
            Success!
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant='body2' sx={{ color: '#44544A' }}>
            {type === 'Recipe' ? 'Recipe' : ''} {id ? 'updated' : 'added'} successfully
          </Typography>
        </div>
      </Box>
      <IconButton
        onClick={() => toast.dismiss(t.id)}
        style={{ position: 'absolute', top: 5, right: 5, float: 'right' }}
      >
        <Icon icon='mdi:close' fontSize={24} />
      </IconButton>
    </Box>
  )
}

export default AddToasterforSuccess
