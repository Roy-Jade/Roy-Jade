import EditIcon from '../../../../assets/edit.svg?react';

interface Props {
    onClick: () => void;
}

export default function EditButton({ onClick }: Props) {
    return (
        <button type="button" className="edit-button" onClick={onClick} aria-label="Modifier">
            <EditIcon />
        </button>
    );
}
