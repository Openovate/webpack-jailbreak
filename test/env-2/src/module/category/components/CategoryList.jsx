const CategoryList = (props) => {
  const { children } = props;
  return (
    <div className="category-list">
      {children}
    </div>
  );
};

module.exports = CategoryList;
