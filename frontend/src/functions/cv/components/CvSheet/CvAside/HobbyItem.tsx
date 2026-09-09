import type { Hobby } from '../../../../../types/Hobby';

interface Props {
    item: Hobby;
    ref?: (node: HTMLLIElement | null) => void;
}

export default function HobbyItem({ item, ref }: Props) {
    return <li ref={ref}>{item.label}</li>;
}
