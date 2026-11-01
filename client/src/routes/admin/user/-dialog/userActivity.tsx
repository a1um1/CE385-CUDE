import Calendar from "#/components/calendar";
import { useAdminViewUserActivity } from "#/data/admin/user.data";

export default function UserActivity(props: { userId: string }) {
  const { data: calendarData, isLoading } = useAdminViewUserActivity(props.userId);

  const currentMonth = new Date().getMonth() + 1;

  // last 3 month list should handle year wrap
  const monthLists: {
    month: number;
    year: number;
  }[] = Array.from({ length: 3 }, (_, i) => {
    const month = currentMonth - i;
    const year = new Date().getFullYear() - (month <= 0 ? 1 : 0);
    return {
      month: month <= 0 ? month + 12 : month,
      year,
    };
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-wrap gap-4">
      {monthLists.map(({ month, year }) => (
        <Calendar
          key={`${year}-${month}`}
          month={month}
          year={year}
          activityData={calendarData || {}}
          containerClassName="w-[300px] flex-shrink-0"
        />
      ))}
    </div>
  );
}
