import React from 'react';
import { Link } from  'geum/components';

export default function Product(props) {
  return (
    <div>
      <h1>Product {props.id}</h1>
      <ul>
        <li><Link history={props.history} to="/">Home</Link></li>
        <li><Link history={props.history} to="/product/1">Product 1</Link></li>
        <li><Link history={props.history} to="/product/2">Product 2</Link></li>
      </ul>
    </div>
  );
}

Product.getInitialProps = async function getInitialProps(route) {
  if (!route.params || !route.params.id) {
    return {};
  }

  const response = await fetch('http://localhost:3000/api/product/' + route.params.id);
  const json = await response.json();
  return json.results || {};
}
