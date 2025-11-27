import clsx from 'clsx';
import styles from './frame.module.scss';

export const Frame = () => {
  return (
    <>
      <div className={clsx(styles.frame, styles['frame--left-top'])}></div>
      <div className={clsx(styles.frame, styles['frame--left-bottom'])}></div>
      <div className={clsx(styles.frame, styles['frame--right-top'])}></div>
      <div className={clsx(styles.frame, styles['frame--right-bottom'])}></div>
    </>
  );
};
