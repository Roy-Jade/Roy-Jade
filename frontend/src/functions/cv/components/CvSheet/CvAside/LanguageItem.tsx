import type { Language } from '../../../../../types/Language';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import EditIcon from '../../../../../assets/edit.svg?react';

interface Props {
    item: Language;
    onEdit?: () => void;
    ref?: (node: HTMLLIElement | null) => void;
}

export default function LanguageItem({ item, onEdit, ref }: Props) {
    return (
        <li ref={ref} className={onEdit ? 'hover-reveal' : undefined}>
            {item.label}
            {onEdit && <HoverAction icon={<EditIcon />} label={`Éditer la langue : ${item.label}`} onClick={onEdit} />}
        </li>
    );
}
