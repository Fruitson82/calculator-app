import { useState, Fragment } from "react";

type Operation = "+" | "-" | "×" | "÷" | null;

function App() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [selectedOperation, setSelectedOperation] = useState<Operation>(null);
  const [lastWasEquals, setLastWasEquals] = useState(false);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 숫자 문자열을 1,000 단위 콤마로 포맷 (소수점/부호 보존)
  const formatNumber = (value: string): string => {
    if (value === "" || value === "-") return value;
    const isNegative = value.startsWith("-");
    const raw = isNegative ? value.slice(1) : value;
    // 소수점 분리
    const [intPart, fracPart] = raw.split(".");
    // 정수부 콤마 포맷
    const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // 소수점이 입력 중일 수 있으므로 존재 여부 보존
    const joined =
      fracPart !== undefined ? `${intWithCommas}.${fracPart}` : intWithCommas;
    return isNegative ? `-${joined}` : joined;
  };

  // 계산식 문자열의 숫자 토큰에만 콤마 적용
  const formatExpression = (expr: string): string => {
    if (!expr) return "";
    const ops = new Set(["+", "-", "×", "÷"]);
    return expr
      .split(" ")
      .map((tok) => {
        if (tok === "" || ops.has(tok)) return tok;
        // 숫자 토큰만 포맷 (음수/소수 지원)
        // 숫자 형태가 아니면 그대로 반환
        if (/^-?\d*(\.\d*)?$/.test(tok)) {
          return formatNumber(tok);
        }
        return tok;
      })
      .join(" ");
  };

  // 표시용 글자 크기 동적 조절 (9자리부터 축소)
  const getDigitCount = (value: string): number => {
    // 콤마, 소수점, 부호 제거 후 자릿수 계산
    return value.replace(/[.,-]/g, "").length;
  };

  const getDisplayFontSize = (value: string): string => {
    const digits = getDigitCount(value);
    const base = 64; // px
    if (digits <= 8) return `${base}px`;
    const min = 28; // 최소 폰트 크기(px)
    const maxDigits = 16; // 이 이상은 최소 크기 유지
    const clamped = Math.min(digits, maxDigits);
    // 8자리에서 base, maxDigits에서 min 로 선형 보간
    const t = (clamped - 8) / (maxDigits - 8);
    const size = Math.round(base - (base - min) * t);
    return `${size}px`;
  };

  // (removed) 이전 공통 버튼 스타일 함수는 사용하지 않아 제거했습니다.

  const inputNumber = (num: string) => {
    if (lastWasEquals) {
      // '=' 이후 새 입력이 시작되면 이전 연산식은 초기화
      setExpression("");
      setLastWasEquals(false);
    }
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: Operation) => {
    if (lastWasEquals) {
      // '=' 이후 연산자를 누르면 결과값부터 새 연산 시작
      setExpression(display + " " + nextOperation);
      setWaitingForOperand(true);
      setSelectedOperation(nextOperation);
      setLastWasEquals(false);
      return;
    }
    const inputValue = display;

    if (expression === "") {
      // 첫 번째 연산
      setExpression(inputValue + " " + nextOperation);
    } else {
      // 연속 연산 - 계산식에 추가
      setExpression(expression + " " + inputValue + " " + nextOperation);
    }

    setWaitingForOperand(true);
    setSelectedOperation(nextOperation);
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
      // 연산 내역은 유지하여 상단에 계속 표시
      setExpression(fullExpression);
      setWaitingForOperand(true);
      setSelectedOperation(null);
      setLastWasEquals(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setExpression("");
    setWaitingForOperand(false);
    setSelectedOperation(null);
    setLastWasEquals(false);
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
    <Fragment>
      {/* Custom Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-out",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "#1C1C1E",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "300px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              border: "1px solid #333333",
              animation: "slideIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                animation: "bounce 0.6s ease-out",
              }}
            >
              💩
            </div>
            <h2
              style={{
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "600",
                margin: "0 0 16px 0",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              한소망 메롱! 똥쟁아~
            </h2>
            <p
              style={{
                color: "#8E8E93",
                fontSize: "16px",
                margin: "0 0 24px 0",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              ㅋㅋㅋ 메롱메롱메롱~~~ 😊
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                backgroundColor: "#FF9500",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(255, 149, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FFB340";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(255, 149, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FF9500";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(255, 149, 0, 0.3)";
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

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
            {/* Expression Display (always rendered with fixed height) */}
            <div
              style={{
                textAlign: "right",
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "300",
                opacity: 0.7,
                marginBottom: "8px",
                height: "28px",
                lineHeight: "28px",
                overflow: "hidden",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              {expression ? formatExpression(expression) : "\u00A0"}
            </div>
            {/* Main Display */}
            <div
              style={{
                textAlign: "right",
                color: "#FFFFFF",
                fontSize: getDisplayFontSize(display),
                fontWeight: "200",
                overflow: "hidden",
                lineHeight: "1",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                whiteSpace: "nowrap",
                height: "96px", // 고정 높이로 레이아웃 안정화
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
              }}
            >
              {formatNumber(display)}
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
                backgroundColor:
                  selectedOperation === "÷" ? "#FFFFFF" : "#FF9500",
                color: selectedOperation === "÷" ? "#FF9500" : "#FFFFFF",
                fontSize: "32px",
                fontWeight: "400",
                borderRadius: "50%",
                height: "80px",
                border: "none",
                cursor: "pointer",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
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
                backgroundColor:
                  selectedOperation === "×" ? "#FFFFFF" : "#FF9500",
                color: selectedOperation === "×" ? "#FF9500" : "#FFFFFF",
                fontSize: "32px",
                fontWeight: "400",
                borderRadius: "50%",
                height: "80px",
                border: "none",
                cursor: "pointer",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
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
                backgroundColor:
                  selectedOperation === "-" ? "#FFFFFF" : "#FF9500",
                color: selectedOperation === "-" ? "#FF9500" : "#FFFFFF",
                fontSize: "32px",
                fontWeight: "400",
                borderRadius: "50%",
                height: "80px",
                border: "none",
                cursor: "pointer",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
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
                backgroundColor:
                  selectedOperation === "+" ? "#FFFFFF" : "#FF9500",
                color: selectedOperation === "+" ? "#FF9500" : "#FFFFFF",
                fontSize: "32px",
                fontWeight: "400",
                borderRadius: "50%",
                height: "80px",
                border: "none",
                cursor: "pointer",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
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
            <p>
              For My Hannas, and DDongJang2 Somang{" "}
              <span
                onClick={() => setShowModal(true)}
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                💩
              </span>
            </p>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default App;
