import clsx from 'clsx';
import styles from './decorative-border.module.scss';

interface DecorativeBorderProps {
  margin?: string;
}

export const DecorativeBorder = ({ margin = '3rem' }: DecorativeBorderProps) => {
  return (
    <div
      className={styles.decorativeBorder}
      style={{
        margin: `${margin} auto`,
      }}
    >
      <div className={styles.decorativeBorder__end}></div>
      <div className={clsx(styles.decorativeBorder__line, styles['decorativeBorder__line--left'])}></div>
      <div className={styles.decorativeBorder__center}></div>
      <div className={clsx(styles.decorativeBorder__line, styles['decorativeBorder__line--right'])}></div>
      <div className={styles.decorativeBorder__end}></div>
    </div>
  );
};
