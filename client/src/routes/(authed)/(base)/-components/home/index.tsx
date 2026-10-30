import CoursesSection from "#/routes/(authed)/(base)/-components/home/courses.section";
import { EventsSections } from "#/routes/(authed)/(base)/-components/home/events.section";
import VideoSections from "#/routes/(authed)/(base)/-components/home/videos.section";

export function HomePanel() {
  return (
    <>
      <CoursesSection />
      <EventsSections />
      <VideoSections />
    </>
  );
}

export default HomePanel;
