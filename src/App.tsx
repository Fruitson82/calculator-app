import { useState } from "react";

type Operation = "+" | "-" | "×" | "÷" | null;

function App() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: Operation) => {
    const inputValue = display;

    if (expression === "") {
      // 첫 번째 연산
      setExpression(inputValue + " " + nextOperation);
    } else {
      // 연속 연산 - 계산식에 추가
      setExpression(expression + " " + inputValue + " " + nextOperation);
    }

    setWaitingForOperand(true);
  };

  const evaluateExpression = (expr: string): number => {
    // 간단한 계산식 평가 (우선순위 고려)
    const tokens = expr.split(" ").filter((token) => token !== "");

    // 곱셈과 나눗셈 먼저 처리
    for (let i = 1; i < tokens.length; i += 2) {
      if (tokens[i] === "×" || tokens[i] === "÷") {
        const left = parseFloat(tokens[i - 1]);
        const right = parseFloat(tokens[i + 1]);
        const result = tokens[i] === "×" ? left * right : left / right;

        tokens.splice(i - 1, 3, result.toString());
        i -= 2;
      }
    }

    // 덧셈과 뺄셈 처리
    let result = parseFloat(tokens[0]);
    for (let i = 1; i < tokens.length; i += 2) {
      const right = parseFloat(tokens[i + 1]);
      if (tokens[i] === "+") {
        result += right;
      } else if (tokens[i] === "-") {
        result -= right;
      }
    }

    return result;
  };

  const performCalculation = () => {
    if (expression !== "") {
      // 현재 입력된 숫자를 계산식에 추가
      const fullExpression = expression + " " + display;
      const result = evaluateExpression(fullExpression);

      setDisplay(String(result));
      setExpression("");
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setExpression("");
    setWaitingForOperand(false);
  };

  const getClearButtonText = () => {
    if (display !== "0" || expression !== "") {
      return "C";
    }
    return "AC";
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: "#000000",
          maxWidth: "375px",
          width: "100%",
        }}
      >
        {/* Display */}
        <div
          style={{
            backgroundColor: "#000000",
            padding: "32px 24px 16px 24px",
          }}
        >
          {/* Expression Display */}
          {expression && (
            <div
              style={{
                textAlign: "right",
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "300",
                opacity: "0.7",
                marginBottom: "8px",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              {expression}
            </div>
          )}
          {/* Main Display */}
          <div
            style={{
              textAlign: "right",
              color: "#FFFFFF",
              fontSize: "64px",
              fontWeight: "200",
              overflow: "hidden",
              lineHeight: "1",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            {display}
          </div>
        </div>

        {/* Button Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            padding: "0 8px 8px 8px",
          }}
        >
          {/* Row 1 */}
          <button
            onClick={clear}
            style={{
              gridColumn: "span 2",
              backgroundColor: "#A6A6A6",
              color: "#000000",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#999999")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#A6A6A6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#A6A6A6")
            }
          >
            {getClearButtonText()}
          </button>
          <button
            onClick={backspace}
            style={{
              backgroundColor: "#A6A6A6",
              color: "#000000",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#999999")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#A6A6A6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#A6A6A6")
            }
          >
            ⌫
          </button>
          <button
            onClick={() => inputOperation("÷")}
            style={{
              backgroundColor: "#FF9500",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#FFAD33")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => inputNumber("7")}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            7
          </button>
          <button
            onClick={() => inputNumber("8")}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            8
          </button>
          <button
            onClick={() => inputNumber("9")}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            9
          </button>
          <button
            onClick={() => inputOperation("×")}
            style={{
              backgroundColor: "#FF9500",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#FFAD33")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => inputNumber("4")}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            4
          </button>
          <button
            onClick={() => inputNumber("5")}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            5
          </button>
          <button
            onClick={() => inputNumber("6")}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            6
          </button>
          <button
            onClick={() => inputOperation("-")}
            style={{
              backgroundColor: "#FF9500",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#FFAD33")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => inputNumber("1")}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            1
          </button>
          <button
            onClick={() => inputNumber("2")}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            2
          </button>
          <button
            onClick={() => inputNumber("3")}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            3
          </button>
          <button
            onClick={() => inputOperation("+")}
            style={{
              backgroundColor: "#FF9500",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#FFAD33")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputNumber("0")}
            style={{
              gridColumn: "span 2",
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "40px",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              textAlign: "left",
              paddingLeft: "32px",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            style={{
              backgroundColor: "#333333",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#333333")
            }
          >
            .
          </button>
          <button
            onClick={performCalculation}
            style={{
              backgroundColor: "#FF9500",
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: "400",
              borderRadius: "50%",
              height: "80px",
              border: "none",
              cursor: "pointer",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = "#FFAD33")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#FF9500")
            }
          >
            =
          </button>
        </div>

        {/* Copyright */}
        <div
          style={{
            textAlign: "right",
            color: "#666666",
            fontSize: "12px",
            fontWeight: "300",
            padding: "16px 24px 8px 24px",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}
        >
          © 2025 Calculator App by Kwang-sik{" "}
          <p>For My Hannas, and DDongJang2 Somang 💩</p>
        </div>
      </div>
    </div>
  );
}

export default App;
