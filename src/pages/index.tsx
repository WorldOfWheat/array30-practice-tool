import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "@/styles/index.module.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <>
      <Head>
        <title>行列高手</title>
        <meta name="description" content="一個為了練習行列所開發的工具" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar tab="home"/>
      <div>
        <div className={`${styles['header']}`}>
          <h1>行列高手 v1.0</h1>
        </div>
        <div className={`mt-5 ${styles['content']}`}>
          <p>
            一個為了練習行列所開發的工具。因為我自己用行列這麼多年了，發現市面上沒有一個專門練習行列的工具，所以就自己開發了一個。
          </p>
          <p>
            介面簡單易用，功能也不多，但足夠讓你練習行列。
          </p>
          <p>
            希望能幫助到更多的行列使用者。
          </p>
          <p>
            如果你在使用過程中有任何問題或建議，歡迎到我的信箱或 GitHub 提出。
          </p>
          <p>
            聯絡信箱：<a href="mailto:a302854888@proton.me">a302854888@proton.me</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
