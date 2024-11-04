type Props = {
  id: string;
  children: React.ReactNode;
};

const Drawer = ({ id, children }: Props) => {
  return (
    <div>
      <div className="drawer z-50">
        <input id={id} type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Page content here */}
          <label htmlFor={id} className="btn btn-primary drawer-button">
            Open drawer
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor={id}
            aria-label="close sidebar"
            className="drawer-overlay"
          >
            X
          </label>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
