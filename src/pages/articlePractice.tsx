import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "@/styles/articlePractice.module.css";
import { useState, useRef, useEffect } from "react";
import { PracticeCard } from "@/components/PracticeCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

function Introduce() {
  return (
    <>
      <div className={`${styles['introduce']}`}>
        <h2>簡介</h2>
        <p>
          這個區域是用來練習文章輸入的地方，您可以匯入自己想要練習的文章，或是使用範例文章來進行練習。
          <br />
          這部分應該要在簡碼熟悉之後再來練習，因為文章的內容會比較複雜，建議先熟悉一級和二級簡碼之後再來挑戰文章輸入。
          <br />
          另外這區有特別碼的選項，是在一級簡碼和二級簡碼之後要再加速用的。
        </p>
        <h2>使用教學</h2>
        <p>
          先在匯入文章的區域，選擇要練習的文章，可以直接貼上文章內容，或是上傳 .txt 檔案，或是選擇範例文章。
          <br />
          接著選擇要練習的一級簡碼、二級簡碼和特別碼，然後就可以開始練習了。
        </p>
      </div>
    </>
  )
}

function ImportArticle({ setArticle }: { setArticle: (article: string) => void }) {
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
    if (value === '') {
      setTextareaValue('');
      return;
    }
    const fileName = value + '.txt';
    const article = await fetch('/' + fileName);
    const text = await article.text();
    setTextareaValue(text);
  }

  return (
    <>
      <div className={`${styles['import-article']}`}>
        <h2>匯入文章</h2>
        <div className={`d-flex gap-3 flex-column`}>
          <select className={`form-select ${styles['import-article-select']}`} onChange={handleChangeSelect}>
            <option value='' selected>自選文章</option>
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
        </div>
        <button
          disabled={textareaValue.trim() === ''}
          className={`mx-auto d-block btn btn-success mt-3 ${styles['import-article-button']}`}
          onClick={() => {
            setArticle(textareaValue);
          }}
        >
          匯入文章
        </button>
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

interface PracticeProps {
  article: string;
}

function Practice(props: PracticeProps) {
  const [useFirstLevel, setUseFirstLevel] = useState<boolean>(true);
  const [useSecondLevel, setUseSecondLevel] = useState<boolean>(true);
  const [useSpecialChar, setUseSpecialChar] = useState<boolean>(false);
  return (
    <>
      <div className={`${styles['practice']}`}>
        <div className="card-body d-flex gap-3">
          <button className={`btn ${useFirstLevel ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUseFirstLevel(!useFirstLevel)}>
            一級簡碼
          </button>
          <button className={`btn ${useSecondLevel ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUseSecondLevel(!useSecondLevel)}>
            二級簡碼
          </button>
          <button className={`btn ${useSpecialChar ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUseSpecialChar(!useSpecialChar)}>
            特別碼
          </button>
        </div>
        <div className={`${styles['practice-card-container']} mt-3`}>
          <PracticeCard article={props.article} useFirstLevel={useFirstLevel} useSecondLevel={useSecondLevel} useSpecialChar={useSpecialChar} />
        </div>
      </div>
    </>
  );
}

export default function ArticlePractice() {
  const [article, setArticle] = useState<string>('');

  return (
    <>
      <Head>
        <title>行列高手</title>
        <meta name="description" content="一個為了練習行列所開發的工具" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar tab="articlePractice" />
      <div className={`d-flex gap-3 flex-column ${styles['container']}`}>
        <Introduce />
        <ImportArticle setArticle={setArticle} />
        {article && <Practice article={article} />}
      </div>
      <Footer />
    </>
  );

}