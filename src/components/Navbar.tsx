import Link from "next/link";
import styles from "./Navbar.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";

export interface NavbarProps {
  tab: 'home' | 'wordPractice' | 'articlePractice' | 'about';
}

export default function Navbar({ tab }: NavbarProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode])

  return (
    <nav className={`navbar navbar-expand-lg ${styles['navbar']}`}>
      <div className="container-fluid">
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className={`nav-link ${tab === 'home' ? 'active' : ''}`} href="/">首頁</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${tab === 'wordPractice' ? 'active' : ''}`} href="/wordPractice">簡碼練習</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${tab === 'articlePractice' ? 'active' : ''}`} href="/articlePractice">文章練習</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${tab === 'about' ? 'active' : ''}`} href="/about">關於</Link>
            </li>
          </ul>
        </div>
        <span onClick={(() => { setDarkMode(!darkMode); })} className={styles['dark-mode-toggle']}>
          {!darkMode ?
            <>
              <i className="bi bi-brightness-high"></i>
            </> : <>
              <i className="bi bi-moon"></i>
            </>}
        </span>
      </div>
    </nav>
  )
}