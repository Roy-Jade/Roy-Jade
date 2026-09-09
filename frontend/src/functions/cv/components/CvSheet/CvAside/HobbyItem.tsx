import type { Hobby } from '../../../../../types/Hobby';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import EditIcon from '../../../../../assets/edit.svg?react';

interface Props {
    item: Hobby;
    onEdit?: () => void;
    ref?: (node: HTMLLIElement | null) => void;
}

export default function HobbyItem({ item, onEdit, ref }: Props) {
    return (
        <li ref={ref} className={onEdit ? 'hover-reveal' : undefined}>
            {item.label}
            {onEdit && <HoverAction icon={<EditIcon />} label={`Éditer le centre d'intérêt : ${item.label}`} onClick={onEdit} />}
        </li>
    );
}
