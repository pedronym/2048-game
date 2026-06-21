import UndoSvg from '@/assets/undo.svg';
import { Shadow } from '@/components';
import styles from './UndoButton.module.css';

interface UndoButtonProps {
  undo: () => void;
  canUndo: boolean;
}

const UndoButton = ({ undo, canUndo }: UndoButtonProps) => {
  return (
    <button
      className={styles.undoBtn}
      disabled={!canUndo}
      onClick={undo}
      aria-label="Undo"
    >
      <div className={styles.undoBtnWrapper}>
        <Shadow />
        <div className={styles.undoBtnInner}>
          <img src={UndoSvg} aria-hidden="true" />
        </div>
      </div>
    </button>
  );
};

export default UndoButton;
