import type { Hardskill } from '../../../../../types/Hardskill';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import HideIcon from '../../../../../assets/icons/hide.svg?react';
import EditIcon from '../../../../../assets/edit.svg?react';

interface Props {
    skill: Hardskill;
    onHide: () => void;
    onEdit?: () => void;
    ref?: (node: HTMLLIElement | null) => void;
}

export default function HardskillItem({ skill, onHide, onEdit, ref }: Props) {
    return (
        <li ref={ref} className="hover-reveal">
            {skill.label}
            <span className="hover-actions">
                {onEdit && (
                    <HoverAction icon={<EditIcon />} label={`Éditer la compétence : ${skill.label}`} onClick={onEdit} />
                )}
                <HoverAction icon={<HideIcon />} label={`Masquer la compétence : ${skill.label}`} onClick={onHide} />
            </span>
        </li>
    );
}
