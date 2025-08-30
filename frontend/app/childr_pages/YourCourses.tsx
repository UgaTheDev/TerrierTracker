import CourseTable from "../components/CourseTable";

export default function YourCourses() {
  return (
    <>
      <div className="flex flex-col gap-6 p-6 md:p-10 ml-[5%]">
        <CourseTable />
      </div>
    </>
  );
}
