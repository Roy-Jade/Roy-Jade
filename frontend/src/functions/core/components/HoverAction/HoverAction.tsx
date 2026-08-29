import './HoverAction.scss';

interface Props {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

export default function HoverAction({ icon, label, onClick }: Props) {
    return (
        <button type="button" className="hover-action" onClick={onClick} aria-label={label}>
            {icon}
        </button>
    );
}
