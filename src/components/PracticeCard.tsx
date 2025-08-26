import { useState, useEffect, useRef } from "react";
import styles from "./PracticeCard.module.css";
import * as tableParser from "@/utils/tableParser";

interface ParticeArticleShowAreaProps {
  article: string[];
  cursorPosition: number;
}

export interface PracticeCardProps {
  article: string;
  useFirstLevel: boolean;
  useSecondLevel: boolean;
  useSpecialChar: boolean;
}

function PracticeArticleWord(props: { character: string, isCursor: boolean }) {
  return (
    <>
      <span className={`${styles['practice-article-word']} ${props.isCursor ? styles['selected'] : ''}`}>
        {props.character}
      </span>
    </>
  )
}

function PracticeArticleShowArea(props: ParticeArticleShowAreaProps) {
  // 自動捲動到目前字元
  useEffect(() => {
    if (props.cursorPosition !== -1) {
      const container = document.querySelector(`.${styles['practice-article-show-area']}`);
      const element = document.querySelector(`.${styles['selected']}`);
      if (container && element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const offset = elementRect.top - containerRect.top;
        container.scrollTop += offset - container.clientHeight / 2 + element.clientHeight / 2;
      }
    }
  }, [props.cursorPosition]);

  return (
    <>
      <div className={`${styles['practice-article-show-area']}`}>
        {props.article.map((char, index) => (
          <PracticeArticleWord
            key={index}
            character={char}
            isCursor={index === props.cursorPosition}
          />
        ))}
      </div>
    </>
  )
}

export function PracticeCard(
  { article, useFirstLevel, useSecondLevel, useSpecialChar }: PracticeCardProps) {
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const articleArray = article.split('').filter(char => char !== '\r' && char !== '\n');
  const [tableLoadFinished, setTableLoadFinished] = useState<boolean>(false);
  const [firstLevelTable, setFirstLevelTable] = useState<Map<string, string[]>>(new Map());
  const [secondLevelTable, setSecondLevelTable] = useState<Map<string, string[]>>(new Map());
  const [specialCharTable, setSpecialCharTable] = useState<Map<string, string[]>>(new Map());
  const [normalCharTable, setNormalCharTable] = useState<Map<string, string[]>>(new Map());
  const [inputValue, setInputValue] = useState<string>('');
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [inputPlaceholder, setInputPlaceholder] = useState<string>('');
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);
  const [wordPerMinute, setWordPerMinute] = useState<number>(0);
  const [totalWrongCount, setTotalWrongCount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 載入表格
  useEffect(() => {
    async function fetchTables() {
      setFirstLevelTable(await tableParser.getFirstLevelTable());
      setSecondLevelTable(await tableParser.getSecondLevelTable());
      setSpecialCharTable(await tableParser.getSpecialCharTable());
      setNormalCharTable(await tableParser.getNormalCharTable());
      setTableLoadFinished(true);
    }
    fetchTables();
  }, [])

  // 計時器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (startTime !== null && !finished) {
      timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startTime, finished]);

  useEffect(() => {
    if (startTime) {
      setWordPerMinute(Math.round(cursorPosition / (((currentTime - startTime) / 1000) / 60)));
    }
    else {
      setWordPerMinute(0);
    }
  }, [currentTime]);

  function getExpectedValues(char: string): Array<string> {
    const firstLevelValue = firstLevelTable.get(char);
    const secondLevelValue = secondLevelTable.get(char);
    const specialCharValue = specialCharTable.get(char);
    const normalCharValue = normalCharTable.get(char);

    if (useFirstLevel && firstLevelValue) {
      return [firstLevelValue[0]];
    }
    if (useSecondLevel && secondLevelValue) {
      return [secondLevelValue[0]];
    }
    if (useSpecialChar && specialCharValue) {
      return [specialCharValue[0]];
    }

    const anyValue: string[] = [];
    if (firstLevelValue) {
      anyValue.push(...firstLevelValue);
    }
    if (secondLevelValue) {
      anyValue.push(...secondLevelValue);
    }
    if (specialCharValue) {
      anyValue.push(...specialCharValue);
    }
    if (normalCharValue) {
      anyValue.push(...normalCharValue);
    }
    return anyValue;
  }

  function handleFinish() {
    setCursorPosition(-1);
    setInputPlaceholder('恭喜完成！');
    setReadOnly(true);
    setFinished(true);
    const timer = setTimeout(() => {
      setTotalWrongCount(0);
      setFinished(false);
      setInputPlaceholder('');
      setReadOnly(false);
      setCursorPosition(0);
      setInputValue('');
      setStartTime(null);
      setCurrentTime(0);
      setWordPerMinute(0);
    }, 3000);
    return () => clearTimeout(timer);
  }

  function handleWrong() {
    setTotalWrongCount((prev) => prev + 1);
    setWrongCount((prev) => prev + 1);
    setInputValue('');
    if (wrongCount >= 2) {
      const expectedChar = articleArray[cursorPosition];
      const expectedValues: string[] = getExpectedValues(expectedChar);
      const showAnswer = expectedValues.map(v => v.replace(' ', '[空白]')).join(' | ');
      setInputPlaceholder(showAnswer!);
      setReadOnly(true);
      setWrongCount(0);
      const timer = setTimeout(() => {
        setInputPlaceholder('');
        setReadOnly(false);
      }, expectedValues.length * 1000);
      return () => clearTimeout(timer);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const value = inputValue;

    if (value.length >= 1) {
      if (startTime === null) {
        setStartTime(Date.now());
        setCurrentTime(Date.now());
      }

      // Handle character input
      const expectedChar = articleArray[cursorPosition];
      const expectedValues: string[] = getExpectedValues(expectedChar);
      if (expectedValues.includes(value)) {
        setCursorPosition((prev) => Math.min(prev + 1, articleArray.length - 1));
        setWrongCount(0);
        setInputValue('');
        if (cursorPosition + 1 >= articleArray.length) {
          handleFinish();
        }
      }
      else {
        const enterKey = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        if (enterKey.includes(value.charAt(value.length - 1))) {
          handleWrong();
        }
      }
    }
  }

  return (
    <>
      {/* 統計資料 */}
      <div>
        <div>
          <i className="bi bi-calculator"></i>
          <span className="ms-2">共 {articleArray.length} 字</span>
        </div>
        <div>
          <i className="bi bi-x-circle"></i>
          <span className="ms-2">錯誤 {totalWrongCount} 次</span>
        </div>
        <div>
          <i className="bi bi-stopwatch"></i>
          {startTime !== null ? (
            <>
              <span className="ms-2">
                {Math.floor((currentTime - startTime) / 1000)} 秒
              </span>
            </>
          ) : (
            <span className="ms-2">尚未開始</span>
          )}
        </div>
        <div>
          <i className="bi bi-speedometer2"></i>
          {startTime !== null && currentTime !== startTime ? (
            <>
              <span className="ms-2">
                {wordPerMinute} 字/分
              </span>
            </>
          ) : (
            <span className="ms-2">尚未開始</span>
          )}
        </div>
      </div>
      <PracticeArticleShowArea article={articleArray} cursorPosition={cursorPosition} />
      <div className={`d-flex justify-content-between align-items-center mt-3`}>
        <input
          className={`mx-auto ${styles['practice-input-area']}`}
          ref={inputRef}
          type="text"
          disabled={tableLoadFinished === false || articleArray.length === 0}
          value={inputValue}
          onKeyUp={(e) => { handleKeyDown(e); }}
          onChange={(e) => { setInputValue(e.target.value); }}
          placeholder={inputPlaceholder}
          readOnly={readOnly}
        />
      </div>
    </>
  )
}