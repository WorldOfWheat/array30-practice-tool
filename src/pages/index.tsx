import Head from "next/head";
import styles from "@/styles/index.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useRef, useEffect } from "react";
import * as tableParser from "@/utils/tableParser";

interface ParticeArticleShowAreaProps {
  article: string[];
  cursorPosition: number;
}

function IntroduceCard() {
  return (
    <>
      <div className={`card`}>
        <div className={`card-header`}>
          <h2 className={`card-title`}>簡介</h2>
        </div>
        <div className={`card-body`}>
          <p className={`card-text`}>
            這個工具是為了練習行列所開發的，使用者可以將文章匯入，然後進行行列練習。
          </p>
        </div>
      </div>
    </>
  )
}

function ImportArticleCard({ setArticle }: { setArticle: (article: string) => void }) {
  const [textareaValue, setTextareaValue] = useState<string>('');
  const [enableUpload, setEnableUpload] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaValue.trim() !== '') {
      setEnableUpload(false);
    } else {
      setEnableUpload(true);
    }
  }, [textareaValue]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setTextareaValue(text);
      };
      reader.readAsText(file);
    }
  }

  async function handleChangeSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const fileName = value + '.txt';
    const article = await fetch('/' + fileName);
    const text = await article.text();
    setTextareaValue(text);
  }

  return (
    <>
      <div className={`card`}>
        <div className={`card-header`}>
          <h2 className={`card-title`}>匯入文章</h2>
        </div>
        <div className={`card-body d-flex gap-3 flex-column`}>
          <select className="form-select" onChange={handleChangeSelect}>
            <option selected>自選文章</option>
            <option value="example1">文章範例 1</option>
            <option value="example2">文章範例 2</option>
            <option value="example3">文章範例 3</option>
          </select>
          <textarea
            className={`form-control ${styles['import-article-textarea']}`}
            rows={8}
            value={textareaValue}
            onChange={(e) => {
              setTextareaValue(e.target.value);
            }}
            placeholder="直接貼上文章內容"
          ></textarea>
          <button
            disabled={!enableUpload}
            className={`btn btn-primary`}
            onClick={() => fileInputRef.current?.click()}
          >
            <i className={`bi bi-file-earmark-arrow-up-fill me-2`}></i>
            讀取檔案（.txt）
          </button>
          <button
            disabled={textareaValue.trim() === ''}
            className={`btn btn-success`}
            onClick={() => {
              setArticle(textareaValue);
            }}
          >
            匯入文章
          </button>
        </div>
        <input
          type="file"
          accept=".txt"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>
    </>
  )
}

function PracticeArticleWord(props: { character: string, isCursor: boolean }) {
  useEffect(() => {
    if (props.isCursor) {
      const element = document.querySelector(`.${styles['selected']}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }, [props.isCursor]);

  return (
    <>
      <span className={`${styles['practice-article-word']} ${props.isCursor ? styles['selected'] : ''}`}>
        {props.character}
      </span>
    </>
  )
}

function PracticeArticleShowArea(props: ParticeArticleShowAreaProps) {
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

function PracticeCard({ article }: { article: string }) {
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
  const [enableFirstLevel, setEnableFirstLevel] = useState<boolean>(true);
  const [enableSecondLevel, setEnableSecondLevel] = useState<boolean>(true);
  const [enableSpecialChar, setEnableSpecialChar] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (startTime !== null) {
      timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startTime]);

  function getExpectedValues(char: string): Array<string> {
    const firstLevelValue = firstLevelTable.get(char);
    const secondLevelValue = secondLevelTable.get(char);
    const specialCharValue = specialCharTable.get(char);
    const normalCharValue = normalCharTable.get(char);

    if (enableFirstLevel && firstLevelValue) {
      return [firstLevelValue[0]];
    }
    if (enableSecondLevel && secondLevelValue) {
      return [secondLevelValue[0]];
    }
    if (enableSpecialChar && specialCharValue) {
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

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const value = inputValue;

    if (value.length >= 1) {
      if (startTime === null) {
        setStartTime(Date.now());
      }

      // Handle character input
      const expectedChar = articleArray[cursorPosition];
      const expectedValues: string[] = getExpectedValues(expectedChar);
      if (expectedValues.includes(value)) {
        setCursorPosition((prev) => Math.min(prev + 1, articleArray.length - 1));
        setWrongCount(0);
        setInputValue('');
      }
      else {
        const enterKey = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        if (enterKey.includes(value.charAt(value.length - 1))) {
          setWrongCount((prev) => prev + 1);
          setInputValue('');
          if (wrongCount >= 2) {
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
      }
    }
  }

  return (
    <>
      <div className={`card`}>
        <div className={`card-header`}>
          <h2 className={`card-title`}>開始練習</h2>
        </div>
        <div className={`card-body`}>
          <p>下面可以切換要啟用的簡碼類別，啟用之後則會強制輸入簡碼</p>
          {/* 功能切換 */}
          <div className="d-flex gap-2">
            <button
              className={`btn  ${enableFirstLevel ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setEnableFirstLevel(!enableFirstLevel)}
            >一級簡碼</button>
            <button
              className={`btn  ${enableSecondLevel ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setEnableSecondLevel(!enableSecondLevel)}
            >二級簡碼</button>
            <button
              className={`btn  ${enableSpecialChar ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setEnableSpecialChar(!enableSpecialChar)}
            >特別碼</button>
          </div>
          <p className="mt-3">點擊下方的輸入框，並且確保目前的輸入法為英文</p>
          <div>
            {startTime !== null && (
              <>
                <i className="bi bi-stopwatch"></i>
                <span className="ms-2">
                  {Math.floor((currentTime - startTime) / 1000)} 秒
                </span>
              </>
            )}
          </div>
          <PracticeArticleShowArea article={articleArray} cursorPosition={cursorPosition} />
          <div className={`d-flex justify-content-between align-items-center mt-3`}>
            <div className={`${styles['stopwatch']}`}>
              <i className="bi bi-stopwatch"></i>
              {startTime !== null && (
                <span className="ms-2">
                  {Math.floor((Date.now() - startTime) / 1000)} 秒
                </span>
              )}
            </div>
            <input
              className={`mt-3 mx-auto ${styles['practice-input-area']}`}
              type="text"
              disabled={tableLoadFinished === false || articleArray.length === 0}
              value={inputValue}
              onKeyUp={(e) => { handleKeyDown(e); }}
              onChange={(e) => { setInputValue(e.target.value); }}
              placeholder={inputPlaceholder}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default function Home() {
  const [article, setArticle] = useState<string>('');

  return (
    <>
      <Head>
        <title>行列高手</title>
        <meta name="description" content="一個為了練習行列所開發的工具" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`m-3 d-flex gap-3 flex-column`}>
        <IntroduceCard />
        <ImportArticleCard setArticle={setArticle} />
        <PracticeCard article={article} />
      </div>
    </>
  );
}
