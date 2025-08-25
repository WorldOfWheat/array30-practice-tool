import styles from "./Footer.module.css";

export default function Footer() {
	return (
		<>
			<footer className={`${styles['footer']}`}>
			<p>
				<a href="https://github.com/WorldOfWheat" target="_blank" rel="noopener noreferrer">
					<i className="bi bi-github"></i>
				</a>
			</p>
			<p>版權所有© 2025 小麥</p>
		</footer>
		</>
	);
};