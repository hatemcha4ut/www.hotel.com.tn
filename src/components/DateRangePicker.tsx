import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, differenceInDays, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DateRangePickerProps {
  checkIn?: Date | null
  checkOut?: Date | null
  onCheckInChange: (date: Date) => void
  onCheckOutChange: (date: Date) => void
  language?: string
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  language = 'fr',
}: DateRangePickerProps) {
  const numberOfNights =
    checkIn && checkOut
      ? differenceInDays(checkOut, checkIn)
      : 0

  const today = new Date().toISOString().split('T')[0]
  
  const checkInValue = checkIn ? format(checkIn, 'yyyy-MM-dd') : ''
  const checkOutValue = checkOut ? format(checkOut, 'yyyy-MM-dd') : ''
  
  const minCheckOut = checkIn 
    ? format(new Date(checkIn.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    : today

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      const date = parseISO(value)
      onCheckInChange(date)
      
      if (checkOut && date >= checkOut) {
        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)
        onCheckOutChange(nextDay)
      }
    }
  }

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      const date = parseISO(value)
      onCheckOutChange(date)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="check-in" className="text-xs font-medium text-muted-foreground">
            Date d'entrée
          </Label>
          <Input
            id="check-in"
            type="date"
            value={checkInValue}
            min={today}
            onChange={handleCheckInChange}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="check-out" className="text-xs font-medium text-muted-foreground">
            Date de sortie
          </Label>
          <Input
            id="check-out"
            type="date"
            value={checkOutValue}
            min={minCheckOut}
            onChange={handleCheckOutChange}
            className="w-full"
          />
        </div>
      </div>

      {numberOfNights > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-center">
          <p className="text-sm font-semibold text-primary">
            {numberOfNights} {numberOfNights === 1 ? 'nuitée' : 'nuitées'}
          </p>
        </div>
      )}
    </div>
  )
}
