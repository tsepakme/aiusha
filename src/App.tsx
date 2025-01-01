import { useState } from 'react';
import './App.scss';

function App() {
  const [count, setCount] = useState(0);
	const increment = 1;
  const handleClick = () => {
    setCount(count + increment);
  };

  return (
    <>
      <div className='greeting'>
        <h1>Hello world</h1>
        <h2>this web page is a testing ground where everything is just being tested</h2>
        <button onClick={handleClick}>+{increment}</button>
        <p>Button clicked {count} times</p>
      </div>
    </>
  );
}

export default App;