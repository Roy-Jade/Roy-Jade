interface Props {
    label: string;
    onClick: () => void;
}

export default function AddButton({ label, onClick }: Props) {
    return (
        <button type="button" className="add-button" onClick={onClick}>
            + {label}
        </button>
    );
}
