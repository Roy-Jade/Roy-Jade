import './Tag.scss';

interface Props {
    label: string;
    variant: 'cv-hardskill' | 'cv-softskill' | 'cv-other' | 'tech';
}

export default function Tag({ label, variant }: Props) {
    return (
        <span className={`tag tag--${variant}`}>
            {label}
        </span>
    );
}