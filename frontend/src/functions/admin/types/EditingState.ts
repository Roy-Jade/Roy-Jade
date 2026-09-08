export type DashboardCategory =
    | 'identity'
    | 'profile'
    | 'domain'
    | 'softskill'
    | 'hardskill'
    | 'experience'
    | 'formation'
    | 'language'
    | 'hobby';

export interface EditingState {
    category: DashboardCategory;
    mode: 'add' | 'edit';
    item?: { id: number };
}
