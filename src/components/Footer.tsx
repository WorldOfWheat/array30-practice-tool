import styles from "./Footer.module.css";

export default function Footer() {
	const githubUrl = "https://github.com/WorldOfWheat/array30-practice-tool";

	return (
		<>
			<footer className={`${styles['footer']}`}>
			<p>
				<a href={githubUrl} target="_blank" rel="noopener noreferrer">
					<i className="bi bi-github"></i>
				</a>
			</p>
			<p>版權所有© 2025 小麥</p>
		</footer>
		</>
	);
};