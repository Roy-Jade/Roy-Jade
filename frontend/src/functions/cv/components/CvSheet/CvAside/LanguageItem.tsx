import type { Language } from '../../../../../types/Language';

interface Props {
    item: Language;
    ref?: (node: HTMLLIElement | null) => void;
}

export default function LanguageItem({ item, ref }: Props) {
    return <li ref={ref}>{item.label}</li>;
}
