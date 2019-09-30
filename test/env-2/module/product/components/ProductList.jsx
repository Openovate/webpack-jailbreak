const ProductList = (props) => {
  const { children } = props;
  return (
    <div className="product-list">
      {children}
    </div>
  );
};

module.exports = ProductList;
