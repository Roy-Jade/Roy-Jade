import type { Hardskill } from '../../../../../types/Hardskill';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import HideIcon from '../../../../../assets/icons/hide.svg?react';

interface Props {
    skill: Hardskill;
    onHide: () => void;
    ref?: (node: HTMLLIElement | null) => void;
}

export default function HardskillItem({ skill, onHide, ref }: Props) {
    return (
        <li ref={ref} className="hover-reveal">
            {skill.label}
            <HoverAction icon={<HideIcon />} label={`Masquer la compétence : ${skill.label}`} onClick={onHide} />
        </li>
    );
}
