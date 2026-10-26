import CoursesSection from "#/routes/(authed)/(base)/-components/home/courses.section";
import { EventsSections } from "#/routes/(authed)/(base)/-components/home/events.section";

export function HomePanel() {
  return (
    <>
      <CoursesSection />
      <EventsSections />
    </>
  );
}

export default HomePanel;
