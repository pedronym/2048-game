import UndoButton from '../UndoButton/UndoButton';
import styles from './Footer.module.css';

interface FooterProps {
  undo: () => void;
  canUndo: boolean;
}

const Footer = ({ undo, canUndo }: FooterProps) => {
  return (
    <footer className={styles.footer}>
      <UndoButton undo={undo} canUndo={canUndo} />
      <p>© {new Date().getFullYear()} Bluedot. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
