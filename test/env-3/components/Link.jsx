import React from 'react';

export default function Link(props) {
  const { to, children } = props;
  props = { href: to, onClick: handle.bind(null, props) };
  return React.createElement('a', props, children);
}

function handle({ to, history, props }, event) {
  event.preventDefault();
  history.push(to, props || {});
  return false;
}
