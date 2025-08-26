import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/about.module.css";

export default function About() {
  return (
    <>
      <Head>
        <title>行列高手</title>
        <meta name="description" content="一個為了練習行列所開發的工具" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar tab="about" />
      <div className={`${styles['container']}`}>
        <p>
          FISH UP 有一個完整的<a href="https://array30.misterfishup.com/">教學網站</a>，而裡面也有一些練習工具，但是一直以來都沒有一個專門的練習工具，所以我就自己開發了一個。
          <br />
          而這個點子一部分參考了我自己的經驗，另一部分則是參考了嘸蝦米的官方練習工具。
        </p>
        <p>
          這個網頁使用了 Next.js、React 和 Bootstrap 開發而成。算是我本人的一個練習專案。
          <br />
          編碼表格來自於 FISH UP 的這個<a href="https://array30.misterfishup.com/download.html">網站</a>，如果有侵權請告知，我會立刻移除。
        </p>
        <p>
          版本：v1.0
          <br />
          作者：小麥 WorldOfWheat
          <br />
          聯絡信箱：<a href="mailto:a302854888@proton.me">a302854888@proton.me</a>
        </p>
      </div>
      <Footer />
    </>
  )
}