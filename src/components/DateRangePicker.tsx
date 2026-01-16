import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarBlank } from '@phosphor-icons/react'
import { format, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

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
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false)

  const numberOfNights =
    checkIn && checkOut
      ? differenceInDays(checkOut, checkIn)
      : 0

  const handleCheckInSelect = (date: Date | undefined) => {
    if (date) {
      onCheckInChange(date)
      setIsCheckInOpen(false)
      
      if (checkOut && date >= checkOut) {
        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)
        onCheckOutChange(nextDay)
      }
    }
  }

  const handleCheckOutSelect = (date: Date | undefined) => {
    if (date) {
      onCheckOutChange(date)
      setIsCheckOutOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-11',
                !checkIn && 'text-muted-foreground'
              )}
            >
              <CalendarBlank className="mr-2 h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">Entrée</span>
                <span className="text-sm">
                  {checkIn ? format(checkIn, 'd MMM', { locale: fr }) : 'Date'}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn || undefined}
              onSelect={handleCheckInSelect}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              locale={fr}
              defaultMonth={checkIn || new Date()}
            />
          </PopoverContent>
        </Popover>

        <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-11',
                !checkOut && 'text-muted-foreground'
              )}
            >
              <CalendarBlank className="mr-2 h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">Sortie</span>
                <span className="text-sm">
                  {checkOut ? format(checkOut, 'd MMM', { locale: fr }) : 'Date'}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut || undefined}
              onSelect={handleCheckOutSelect}
              disabled={(date) => {
                const today = new Date(new Date().setHours(0, 0, 0, 0))
                if (date < today) return true
                if (checkIn && date <= checkIn) return true
                return false
              }}
              locale={fr}
              defaultMonth={checkOut || checkIn || new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {numberOfNights > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center">
          <p className="text-sm font-semibold text-primary">
            {numberOfNights} {numberOfNights === 1 ? 'nuitée' : 'nuitées'}
          </p>
        </div>
      )}
    </div>
  )
}
