import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarBlank } from '@phosphor-icons/react'
import { format, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

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
  const [isOpen, setIsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: checkIn || undefined,
    to: checkOut || undefined,
  })

  useEffect(() => {
    setDateRange({
      from: checkIn || undefined,
      to: checkOut || undefined,
    })
  }, [checkIn, checkOut])

  const numberOfNights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from) {
      onCheckInChange(range.from)
    }
    if (range?.to) {
      onCheckOutChange(range.to)
    }
  }

  const formatDateDisplay = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'd MMM', { locale: fr })} - ${format(
        dateRange.to,
        'd MMM yyyy',
        { locale: fr }
      )}`
    }
    if (dateRange?.from) {
      return format(dateRange.from, 'd MMM yyyy', { locale: fr })
    }
    return language === 'fr' ? 'Sélectionner les dates' : 'Select dates'
  }

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal h-11',
              !dateRange?.from && 'text-muted-foreground'
            )}
          >
            <CalendarBlank className="mr-2 h-4 w-4" />
            {formatDateDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-3">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              locale={fr}
              defaultMonth={dateRange?.from || new Date()}
            />
            {numberOfNights > 0 && (
              <div className="border-t pt-3 text-center bg-primary/5 -mx-4 px-4 -mb-3 pb-4 rounded-b-lg">
                <p className="text-base font-semibold text-primary">
                  {numberOfNights} {numberOfNights === 1 ? 'nuitée' : 'nuitées'}
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
