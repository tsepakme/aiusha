import { useState } from 'react';
import './App.scss';

function App() {
  const [display, setDisplay] = useState('0');

  const handleButtonClick = (value: string) => {
    setDisplay(display + value);
  };

  const handleClear = () => {
    setDisplay('');
  };

  const handleEqual = () => {
    try {
      setDisplay(eval(display).toString());
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <>
      <div className='greeting'>
        <h1>Hello world</h1>
        <h2>this web page is a testing ground where everything is just being tested</h2>
        <div className='display'>{display}</div>
        <div className='buttons'>
          <button onClick={() => handleButtonClick('1')}>1</button>
          <button onClick={() => handleButtonClick('2')}>2</button>
          <button onClick={() => handleButtonClick('3')}>3</button>
          <button onClick={() => handleButtonClick('+')}>+</button>
          <button onClick={() => handleButtonClick('4')}>4</button>
          <button onClick={() => handleButtonClick('5')}>5</button>
          <button onClick={() => handleButtonClick('6')}>6</button>
          <button onClick={() => handleButtonClick('-')}>-</button>
          <button onClick={() => handleButtonClick('7')}>7</button>
          <button onClick={() => handleButtonClick('8')}>8</button>
          <button onClick={() => handleButtonClick('9')}>9</button>
          <button onClick={() => handleButtonClick('*')}>*</button>
          <button onClick={() => handleButtonClick('0')}>0</button>
          <button onClick={() => handleButtonClick('.')}>.</button>
          <button onClick={handleClear}>C</button>
          <button onClick={() => handleButtonClick('/')}>/</button>
          <button onClick={handleEqual}>=</button>
        </div>
      </div>
    </>
  );
}

export default App;