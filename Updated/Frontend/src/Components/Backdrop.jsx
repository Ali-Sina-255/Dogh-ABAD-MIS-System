const Backdrop = ({ onClick }) => {
  return (
    <div
      className="fixed inset-0 bg-black opacity-50 z-10"
      onClick={onClick}
    ></div>
  );
};

export default Backdrop;
