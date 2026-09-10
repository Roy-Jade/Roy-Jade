import { useEffect, useState } from 'react';
import './DateInput.scss';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

function parseDate(value: string): { day: string; month: string; year: string } {
    const parts = value.split('/');
    if (parts.length === 3) return { day: parts[0], month: parts[1], year: parts[2] };
    if (parts.length === 2) return { day: '', month: parts[0], year: parts[1] };
    if (parts.length === 1 && parts[0]) return { day: '', month: '', year: parts[0] };
    return { day: '', month: '', year: '' };
}

function buildDate(day: string, month: string, year: string): string {
    if (!year) return '';
    if (!month) return year;
    if (!day) return `${month}/${year}`;
    return `${day}/${month}/${year}`;
}

export default function DateInput({ value, onChange }: Props) {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        const parsed = parseDate(value);
        setDay(parsed.day);
        setMonth(parsed.month);
        setYear(parsed.year);
    }, [value]);

    // Le jour n'a de sens qu'accompagné du mois : le vider en même temps que le
    // mois évite d'afficher une valeur qui serait de toute façon ignorée à l'envoi.
    const update = (newDay: string, newMonth: string, newYear: string) => {
        if (!newMonth) newDay = '';
        setDay(newDay);
        setMonth(newMonth);
        setYear(newYear);
        onChange(buildDate(newDay, newMonth, newYear));
    };

    return (
        <span className="date-input">
            <input
                type="number"
                placeholder="jj"
                min={1}
                max={31}
                value={day}
                onChange={e => update(e.target.value, month, year)}
            />
            <input
                type="number"
                placeholder="mm"
                min={1}
                max={12}
                value={month}
                onChange={e => update(day, e.target.value, year)}
            />
            <input
                type="number"
                placeholder="aaaa"
                min={1000}
                max={9999}
                value={year}
                onChange={e => update(day, month, e.target.value)}
            />
        </span>
    );
}
