import React from 'react';
import { useRouter } from 'next/router';
// import { createRoot } from 'react-dom/client';

// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(<App />);

const Index = () => {
  const { query } = useRouter();
  const { orgUrl } = query;
  return <div>{orgUrl}</div>;
}

export default Index;
