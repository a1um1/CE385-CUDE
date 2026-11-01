import Calendar from "#/components/calendar";
import { useAdminViewUserActivity } from "#/data/admin/user.data";

export default function UserActivity(props: { userId: string }) {
  const { data: calendarData, isLoading } = useAdminViewUserActivity(props.userId);

  const now = new Date();

  // Generate the last 3 months with correct year/month boundaries
  const monthLists = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
    return {
      month: d.getMonth() + 1,
      year: d.getFullYear(),
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
