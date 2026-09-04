import Content from "./Content";
import ContentSidebar from "./ContentSidebar";

export default function ContentBody() {
  return (
    <div className="drawer lg:drawer-open">
      <input
        id="my-drawer-4"
        type="checkbox"
        className="drawer-toggle inline"
      />
      <div className="drawer-content">
        <Content />
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible sidebar-background">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="flex min-h-full flex-col items-start   is-drawer-close:w-14 is-drawer-open:w-64">
          {/* Sidebar content here */}
          <ContentSidebar />
        </div>
      </div>
    </div>
  );
}
