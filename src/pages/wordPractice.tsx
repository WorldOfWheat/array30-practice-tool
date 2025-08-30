import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect } from "react";
import styles from "@/styles/wordPractice.module.css";
import * as tableParser from "@/utils/tableParser";
import { PracticeCard } from "@/components/PracticeCard"
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Introduce() {
  return (
    <>
      <div className={`${styles['introduce']}`}>
        <h2>簡介</h2>
        <p>
          這個區域主要用來練習一級簡碼和二級簡碼的記憶。其中一級簡碼最為重要，一般來說初學者在每分鐘能夠打出 20 至 30 個字就要開始學習。
          <br />
          而二級簡碼則是進階的練習內容，能夠再更進一步的提升速度，但是需要更多的練習和時間來掌握。
        </p>
        <h2>使用教學</h2>
        <p>
          您可以選擇要練習的簡碼，並透過「設定完成」按鈕來產生練習的文字。
          <br />
          二級簡碼需要選擇兩個字母來組成一個簡碼，您可以分別選擇第一碼和第二碼的字母。
        </p>
      </div>
    </>
  )
}

interface ModeSelectionButtonProps {
  character: string;
  selectedCharacters: string[];
  setSelectedCharacters: (chars: string[]) => void;
}

function ModeSelectionButton({
  character,
  selectedCharacters,
  setSelectedCharacters
}: ModeSelectionButtonProps) {

  const handleClick = () => {
    if (selectedCharacters.includes(character)) {
      setSelectedCharacters(selectedCharacters.filter(char => char !== character));
    }
    else {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  return (
    <button className={`btn btn-outline-primary ${styles['mode-button']} ${selectedCharacters.includes(character) ? 'active' : ''}`} onClick={handleClick}>
      {character}
    </button>
  )
}


function ModeSelectionButtonGroup({
  selectedCharacters,
  setSelectedCharacters
}: {
  selectedCharacters: string[];
  setSelectedCharacters: (chars: string[]) => void;
}
) {
  const firstRow = 'QWERTYUIOP';
  const secondRow = 'ASDFGHJKL;';
  const thirdRow = 'ZXCVBNM,./';

  return (
    <div className="d-flex gap-1 flex-column">
      <div className="d-flex gap-1">
        {firstRow.split('').map((key, i) => (
          <ModeSelectionButton
            key={i}
            character={key}
            selectedCharacters={selectedCharacters}
            setSelectedCharacters={setSelectedCharacters} />
        ))}
      </div>
      <div className="d-flex gap-1">
        {secondRow.split('').map((key, i) => (
          <ModeSelectionButton
            key={i}
            character={key}
            selectedCharacters={selectedCharacters}
            setSelectedCharacters={setSelectedCharacters} />
        ))}
      </div>
      <div className="d-flex gap-1">
        {thirdRow.split('').map((key, i) => (
          <ModeSelectionButton
            key={i}
            character={key}
            selectedCharacters={selectedCharacters}
            setSelectedCharacters={setSelectedCharacters} />
        ))}
      </div>
    </div>
  )
}

interface ModeSelectCardProps {
  setArticle: (article: string) => void;
}

function generateFirstLevelCombinations(characters: string[]): string[] {
  const results: string[] = [];
  for (let i = 0; i <= 9; i++) {
    for (const character of characters) {
      results.push(character.toLocaleLowerCase() + i.toString());
    }
  }
  return results;
}

function generateSecondLevelCombinations(firstChars: string[], secondChars: string[]) {
  const results: string[] = [];
  for (let i = 0; i <= 9; i++) {
    for (const firstChar of firstChars) {
      for (const secondChar of secondChars) {
        results.push(firstChar.toLocaleLowerCase() + secondChar.toLocaleLowerCase() + i.toString());
      }
    }
  }
  return results;
}

function ModeSelect({
  setArticle
}: ModeSelectCardProps) {
  const [firstLevelSelectedCharacters, setFirstLevelSelectedCharacters] = useState<string[]>([]);
  const [secondLevelFirstSelectedCharacters, setSecondLevelFirstSelectedCharacters] = useState<string[]>([]);
  const [secondLevelSecondSelectedCharacters, setSecondLevelSecondSelectedCharacters] = useState<string[]>([]);
  const firstLevelCombinations = generateFirstLevelCombinations(firstLevelSelectedCharacters);
  const secondLevelCombinations = generateSecondLevelCombinations(secondLevelFirstSelectedCharacters, secondLevelSecondSelectedCharacters);
  const [firstLevelTable, setFirstLevelTable] = useState<Map<string, string[]>>(new Map());
  const [secondLevelTable, setSecondLevelTable] = useState<Map<string, string[]>>(new Map());

  // 載入表格
  useEffect(() => {
    async function fetchTables() {
      setFirstLevelTable(await tableParser.getFirstLevelTable(true));
      setSecondLevelTable(await tableParser.getSecondLevelTable(true));
    }
    fetchTables();
  }, [])

  function handleSelectAll(setCharacters: (chars: string[]) => void) {
    const characters = 'QWERTYUIOPASDFGHJKL;ZXCVBNM,./';
    setCharacters(characters.split(''));
  }

  function shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }

  function generateArticle() {
    let article = '';
    for (const combo of firstLevelCombinations) {
      const entry: string[] | undefined = firstLevelTable.get(combo);
      if (entry) {
        article += entry[0];
      }
    }
    for (const combo of secondLevelCombinations) {
      const entry: string[] | undefined = secondLevelTable.get(combo);
      if (entry && entry[0] != '⎔') {
        article += entry[0];
      }
    }

    article = shuffleArray(article.split('')).join('');
    return article;
  }

  return (
    <>
      <div className={`${styles['mode-select']}`}>
        <h2>模式選擇</h2>
        <p>請選擇您要練習的簡碼，並按下「設定完成」按鈕來產生練習的文字。</p>
        <div className={`${styles['mode-select-section']}`}>
          <p>一級簡碼</p>
          <div className={`d-flex align-items-center mb-2 gap-2`}>
            <button className="btn btn-outline-success" onClick={() => handleSelectAll(setFirstLevelSelectedCharacters)}>
              選擇所有
            </button>
            <button className="btn btn-outline-danger" onClick={() => setFirstLevelSelectedCharacters([])}>
              清空所有
            </button>
          </div>
          <ModeSelectionButtonGroup
            selectedCharacters={firstLevelSelectedCharacters}
            setSelectedCharacters={setFirstLevelSelectedCharacters} />
        </div>
        <div className={`${styles['mode-select-section']} mt-3`}>
          <p>二級簡碼</p>
          <div className={`d-flex mb-2 gap-4`}>
            <div>
              <button className="btn btn-outline-success me-2" onClick={() => handleSelectAll(setSecondLevelFirstSelectedCharacters)}>
                全選第一碼
              </button>
              <button className="btn btn-outline-danger" onClick={() => setSecondLevelFirstSelectedCharacters([])}>
                清空第一碼
              </button>
              <div className="mt-2">
                <ModeSelectionButtonGroup
                  selectedCharacters={secondLevelFirstSelectedCharacters}
                  setSelectedCharacters={setSecondLevelFirstSelectedCharacters}
                />
              </div>
            </div>
            <div>
              <button className="btn btn-outline-success me-2" onClick={() => handleSelectAll(setSecondLevelSecondSelectedCharacters)}>
                全選第二碼
              </button>
              <button className="btn btn-outline-danger" onClick={() => setSecondLevelSecondSelectedCharacters([])}>
                清空第二碼
              </button>
              <div className="mt-2">
                <ModeSelectionButtonGroup
                  selectedCharacters={secondLevelSecondSelectedCharacters}
                  setSelectedCharacters={setSecondLevelSecondSelectedCharacters}
                />
              </div>
            </div>
          </div>
        </div>
        <button className="btn btn-primary mt-2" onClick={() => {
          const article = generateArticle();
          setArticle(article);
        }}>生成</button>
      </div>
    </>
  )
}

interface PracticeProps {
  article: string;
}

function Practice({ article }: PracticeProps) {
  return (
    <>
      <div className={`${styles['practice']}`}>
        <h2>練習區</h2>
        <p>請依照下方的文字進行練習，完成後可以再按下「生成」按鈕來產生新的練習文字。</p>
        <p>點擊下方的輸入框，並且確保目前的輸入法為英文</p>
        <div className={`${styles['practice-card-container']}`}>
          <PracticeCard article={article} useFirstLevel={true} useSecondLevel={true} useSpecialChar={false} />
        </div>
      </div>
    </>
  );
}

export default function Index() {
  const [article, setArticle] = useState<string>('');

  return (
    <>
      <Head>
        <title>行列高手</title>
        <meta name="description" content="一個為了練習行列所開發的工具" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar tab="wordPractice" />
      <div className={`d-flex gap-3 flex-column ${styles['container']}`}>
        <Introduce />
        <ModeSelect
          setArticle={setArticle}
        />
        {article && <Practice article={article} />}
      </div>
      <Footer />
    </>
  )
}
