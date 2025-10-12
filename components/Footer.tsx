import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>© {currentYear} LifeMap</p>
        <p className={styles.tagline}>Your life journey, beautifully visualized</p>
      </div>
    </footer>
  );
}
