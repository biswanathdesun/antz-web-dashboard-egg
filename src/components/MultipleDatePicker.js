// ** React Imports
import { useState, forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'

// ** Styled Component
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Third Party Imports
import format from 'date-fns/format'
import addDays from 'date-fns/addDays'
import DatePicker from 'react-datepicker'

const MultipleDatePicker = ({ popperPlacement, handleOnChangeRange }) => {
  // ** States
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(addDays(new Date(), 15))
  const [startDateRange, setStartDateRange] = useState(new Date())
  const [endDateRange, setEndDateRange] = useState(addDays(new Date(), 45))

  const handleOnChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  // const handleOnChangeRange = dates => {
  //   const [start, end] = dates
  //   setStartDateRange(start)
  //   setEndDateRange(end)
  // }

  const CustomInput = forwardRef((props, ref) => {
    const startDate = format(props.start, 'MM/dd/yyyy')
    const endDate = props.end !== null ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null
    const value = `${startDate}${endDate !== null ? endDate : ''}`

    return <TextField inputRef={ref} label={props.label || ''} {...props} value={value} />
  })

  return (
    <DatePickerWrapper>
      <Box>
        {/* <div>
        <DatePicker
          selectsRange
          endDate={endDate}
          selected={startDate}
          startDate={startDate}
          id='date-range-picker'
          onChange={handleOnChange}
          shouldCloseOnSelect={false}
          popperPlacement={popperPlacement}
          customInput={<CustomInput label='Date Range' start={startDate} end={endDate} />}
        />
      </div> */}
        <div>
          <DatePicker
            selectsRange
            monthsShown={2}
            endDate={endDateRange}
            selected={startDateRange}
            startDate={startDateRange}
            shouldCloseOnSelect={false}
            id='date-range-picker-months'
            onChange={handleOnChangeRange}
            popperPlacement={popperPlacement}
            customInput={<CustomInput label='Dates' end={endDateRange} start={startDateRange} />}
          />
        </div>
      </Box>
    </DatePickerWrapper>
  )
}

export default MultipleDatePicker
