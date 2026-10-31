import Button from "#/components/button";

const videoMocks: {
  id: string;
  videoURL: string;
  title: string;
  author: string;
  runTime: string;
}[] = [
  {
    id: "intro-cs",
    videoURL: "https://www.youtube.com/watch?v=5LeZflr8Zfs",
    title: "Introduction to Computer Science",
    author: "Khan Academy",
    runTime: "5:44",
  },
  {
    id: "variables-and-data-types",
    videoURL: "https://www.youtube.com/watch?v=52RHZdBSjTw",
    title: "Variables and Data Types",
    author: "Khan Academy",
    runTime: "4:43",
  },
  {
    id: "data-structures",
    videoURL: "https://www.youtube.com/watch?v=WZQRJjeG6lo",
    title: "Data Structures and Algorithms",
    author: "Khan Academy",
    runTime: "3:44",
  },
  {
    id: "c-programming",
    videoURL: "https://www.youtube.com/watch?v=SlqjA04_dpk",
    title: "C Programming",
    author: "CS50",
    runTime: "2:30:17",
  },
];

export function VideoSections() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">เนื้อหา</h1>
        <Button variant="secondary">ดูทั้งหมด</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {videoMocks.map((video) => (
          <a
            href={video.videoURL}
            target="_blank"
            rel="noopener noreferrer"
            key={video.id}
            className="flex flex-col gap-2 hover:bg-gray-900 rounded-md border-6 border-transparent hover:border-gray-900 transition-all duration-200"
          >
            <div className="relative">
              <img
                src={`https://img.youtube.com/vi/${video.videoURL.split("v=")[1]}/hqdefault.jpg`}
                alt={video.title}
                className="w-full h-auto rounded shadow-md aspect-video object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1 py-0.5 rounded-xs font-bold">
                {video.runTime}
              </div>
            </div>
            <h2 className="font-semibold line-clamp-2 min-h-[3em]">{video.title}</h2>
            <p className="text-sm text-gray-400">{video.author}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

export default VideoSections;
