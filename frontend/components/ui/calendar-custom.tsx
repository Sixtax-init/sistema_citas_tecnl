"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type CalendarProps = {
    selectedDate?: Date
    onSelectDate: (date: Date) => void
    availableDates?: string[] // ISO strings of dates with slots
    className?: string
}

export function Calendar({ selectedDate, onSelectDate, availableDates = [], className }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date())

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const renderDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        const firstDay = getFirstDayOfMonth(year, month) // 0=Sun, 1=Mon...

        const days = []
        // Padding for empty start days
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`pad-${i}`} className="h-10 w-10" />)
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            // Adjust for timezone offset to compare string correctly or just use simple comparison
            // toISOString is UTC. Let's use local YYYY-MM-DD construction.
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

            const dayOfWeek = date.getDay()
            // User requested Mon-Fri
            const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
            const isPast = date < today

            const hasSlots = availableDates.includes(dateString)
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year

            // Logic: Valid working day = Weekday & Not Past.
            const isValidDay = isWeekday && !isPast

            days.push(
                <button
                    type="button"
                    key={day}
                    disabled={!isValidDay}
                    onClick={() => onSelectDate(date)}
                    className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-sm transition-colors relative",
                        isSelected ? "bg-blue-600 text-white hover:bg-blue-700 font-bold" : "hover:bg-gray-100",
                        !isValidDay && "text-gray-300 cursor-not-allowed",
                        isValidDay && !isSelected && "text-gray-700",
                        // Indicator for available slots
                        isValidDay && hasSlots && !isSelected && "font-semibold text-blue-600 bg-blue-50 ring-1 ring-blue-200"
                    )}
                >
                    {day}
                    {/* Dot for slots */}
                    {isValidDay && hasSlots && (
                        <span className={cn("absolute bottom-1 h-1 w-1 rounded-full", isSelected ? "bg-white" : "bg-blue-500")}></span>
                    )}
                </button>
            )
        }
        return days
    }

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

    return (
        <div className={cn("p-4 bg-white rounded-lg shadow border", className)}>
            <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="h-5 w-5" /></button>
                <span className="font-semibold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
                    <div key={d} className="text-xs font-medium text-gray-500">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 justify-items-center">
                {renderDays()}
            </div>
        </div>
    )
}
