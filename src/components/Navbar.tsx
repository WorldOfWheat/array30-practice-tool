import Link from "next/link";
import styles from "./Navbar.module.css";

export interface NavbarProps { 
  tab: 'home' | 'wordPractice' | 'articlePractice' | 'about';
}

export default function Navbar({ tab }: NavbarProps) {
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
      </div>
    </nav>
  )
}