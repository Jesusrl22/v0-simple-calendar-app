"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
}

interface TeamCalendarProps {
  tasks: Task[];
}

export function TeamCalendar({ tasks }: TeamCalendarProps) {
  const { language } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const dayLabels = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"],
    fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    it: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
  };

  const translations = {
    en: { more: "more" },
    es: { more: "más" },
    fr: { more: "de plus" },
    de: { more: "weitere" },
    it: { more: "altri" },
  };

  const t = translations[language as keyof typeof translations] || translations.en;
  const days = dayLabels[language as keyof typeof dayLabels] || dayLabels.en;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.due_date) {
        const dateKey = format(new Date(task.due_date), "yyyy-MM-dd");
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(task);
      }
    });
    return map;
  }, [tasks]);

  const firstDayOfWeek = getDay(monthStart);
  const previousMonthDays = Array(firstDayOfWeek).fill(null);
  const calendarDays = [...previousMonthDays, ...daysInMonth];

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-base sm:text-lg md:text-xl">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-b from-card/80 via-card/50 to-card/30 border-border/50">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {days.map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <div
                key={dateKey}
                className={`aspect-square p-1.5 sm:p-2 rounded-lg border transition-all ${
                  isToday 
                    ? "bg-primary/20 border-primary shadow-md" 
                    : "border-border/50 bg-card/40 hover:bg-card/60 hover:border-border"
                } ${!isCurrentMonth ? "opacity-30" : ""}`}
              >
                <div className="text-xs sm:text-sm font-semibold mb-0.5">{format(day, "d")}</div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className="text-xs bg-gradient-to-r from-blue-500/30 to-blue-400/20 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded truncate hover:bg-blue-500/40 transition-colors cursor-pointer"
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1 font-medium">
                      +{dayTasks.length - 2} {t.more}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
