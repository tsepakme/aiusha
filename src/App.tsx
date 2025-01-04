import { useState } from 'react';
import './App.scss';

function App() {
  const [count, setCount] = useState(0);
  const [increment, setIncrement] = useState(1);
	
  const handleIncrease = () => {
    setCount(count + increment);
  };
  const handleDecrease = () => {
    setCount(count - increment);
  };

  const handleIncrementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncrement(Number(event.target.value));
  };

  return (
    <>
      <div className='greeting'>
        <h1>Hello world</h1>
        <h2>this web page is a testing ground where everything is just being tested</h2>
        <input type='number' placeholder='increase/decrease by' value={increment}  onChange={handleIncrementChange}/>
        <button onClick={handleIncrease}>+{increment}</button>
        <button onClick={handleDecrease}>-{increment}</button>
        <p>Current count: {count}</p>
      </div>
    </>
  );
}

export default App;