import { useEffect, useRef, useState } from "react";

const Calculator = ({ isOpen }: { isOpen: boolean }) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("0");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (value: string) => {
    if (value === "=") {
      try {
        const trimmedInput = input.replace(/[\+\-\*\/%]+$/, "");
        if (trimmedInput.includes("%")) {
          const modifiedInput = trimmedInput.replace(
            /(\d+)%(\d+)/,
            (_, num1, num2) => {
              return `(${num1} * ${num2} / 100)`;
            }
          );
          setResult(eval(modifiedInput).toString());
        } else {
          setResult(eval(trimmedInput).toString());
        }
      } catch {
        setResult("0");
      }
    } else if (value === "AC") {
      setInput("");
      setResult("0");
    } else if (value === "X") {
      handleBackspace();
    } else {
      if (["+", "-", "*", "/", "%"].includes(value)) {
        if (["*", "/", "%"].includes(value) && input.length === 0) {
          return;
        }
        if (["+", "-", "*", "/", "%"].includes(input.slice(-1))) {
          const updatedInput = input.slice(0, -1) + value;
          setInput(updatedInput);
          return;
        } else {
          insertAtCursor(value);
        }
      } else {
        insertAtCursor(value);
      }
    }
  };

  const handleBackspace = () => {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart ?? input.length;
      if (cursorPos > 0) {
        const updatedInput =
          input.slice(0, cursorPos - 1) + input.slice(cursorPos);
        setInput(updatedInput);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = cursorPos - 1;
            inputRef.current.selectionEnd = cursorPos - 1;
          }
        }, 0);
      }
    }
  };

  const insertAtCursor = (value: string) => {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart ?? input.length;
      const updatedInput =
        input.slice(0, cursorPos) + value + input.slice(cursorPos);
      setInput(updatedInput);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = cursorPos + value.length;
          inputRef.current.selectionEnd = cursorPos + value.length;
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    const calculatorKeys = [
      "+",
      "-",
      "*",
      "/",
      "%",
      "Enter",
      "Backspace",
      "Escape",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
    ];

    if (calculatorKeys.includes(key)) {
      e.preventDefault();
    }

    if (["+", "-", "*", "/", "%"].includes(key)) {
      handleClick(key);
    } else if (key === "Enter") {
      handleClick("=");
    } else if (key === "Backspace") {
      handleClick("X");
    } else if (key === "Delete") {
      handleClick("AC");
    } else if (!isNaN(Number(key))) {
      handleClick(key);
    } else if (key === ".") {
      handleClick(".");
    } else if (key === "ArrowLeft" || key === "ArrowRight") {
      handleArrowKeys(key);
    }
  };

  const handleArrowKeys = (direction: string) => {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart ?? input.length;
      if (direction === "ArrowLeft" && cursorPos > 0) {
        inputRef.current.setSelectionRange(cursorPos - 1, cursorPos - 1);
      } else if (direction === "ArrowRight" && cursorPos < input.length) {
        inputRef.current.setSelectionRange(cursorPos + 1, cursorPos + 1);
      }
    }
  };

  useEffect(() => {
    setResult("0");
    setInput("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const commonClass = "p-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300";

  return (
    <div className="max-w-xs w-[500px] mx-auto p-4 bg-white rounded-lg border border-borderColor shadow-lg">
      <div className="mb-4">
        <input
          type="text"
          value={input}
          placeholder="0"
          className="w-full text-right text-base p-2 bg-gray-100 rounded-md mb-2 focus:outline-none border"
          ref={inputRef}
          onKeyDown={handleKeyDown}
        />
        <h1 className="text-right text-base">{result}</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {["AC", "X", "%", "/"].map((item) => (
          <button
            key={item}
            className={`bg-gray-300 hover:bg-gray-400 ${commonClass}`}
            onClick={() => handleClick(item)}
          >
            {item}
          </button>
        ))}
        {["7", "8", "9", "*"].map((item) => (
          <button
            key={item}
            className={commonClass}
            onClick={() => handleClick(item)}
          >
            {item}
          </button>
        ))}
        {["4", "5", "6", "-"].map((item) => (
          <button
            key={item}
            className={commonClass}
            onClick={() => handleClick(item)}
          >
            {item}
          </button>
        ))}
        {["1", "2", "3", "+"].map((item) => (
          <button
            key={item}
            className={commonClass}
            onClick={() => handleClick(item)}
          >
            {item}
          </button>
        ))}
        <button
          className="col-span-2 p-2 bg-gray-200 hover:bg-gray-300 text-sm rounded-md"
          onClick={() => handleClick("0")}
        >
          0
        </button>
        <button className={commonClass} onClick={() => handleClick(".")}>
          .
        </button>
        <button
          className="p-2 bg-primaryColor hover:bg-darkPrimaryColor text-white text-sm rounded-md"
          onClick={() => handleClick("=")}
        >
          =
        </button>
      </div>
    </div>
  );
};

export default Calculator;
