import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.icon}>🌍</span>
          LifeMap
        </h1>
        <p className={styles.subtitle}>
          당신의 인생 여정을 아름답게 시각화합니다
        </p>
        <p className={styles.description}>
          프라이버시를 최우선으로 하는 위치 기반 일기 앱
        </p>
        <div className={styles.actions}>
          <Link href="/auth/signup" className={styles.primaryButton}>
            무료로 시작하기
          </Link>
          <Link href="/auth/login" className={styles.secondaryButton}>
            로그인
          </Link>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🗺️</div>
          <h3>인터랙티브 지도</h3>
          <p>타임라인 컨트롤과 레이어 토글로 당신의 위치 히스토리를 탐색하세요</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📝</div>
          <h3>Day One 스타일 일기</h3>
          <p>위치 컨텍스트와 함께 일기를 작성하고 추억을 기록하세요</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📸</div>
          <h3>사진 관리</h3>
          <p>EXIF 데이터에서 자동으로 위치를 추출하여 지도에 표시합니다</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔒</div>
          <h3>프라이버시 우선</h3>
          <p>로컬 저장소와 선택적 iCloud 동기화로 데이터를 안전하게 보호합니다</p>
        </div>
      </section>
    </div>
  );
}
