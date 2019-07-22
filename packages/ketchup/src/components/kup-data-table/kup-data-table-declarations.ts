export interface Column {
    name: string;
    title: string;
    size?: number;
    visible?: boolean;
    hideValuesRepetitions?: boolean;
}

export interface Row {
    cells: {
        [index: string]: Cell;
    };

    actions?: Array<RowAction>;

    id?: string;

    group?: {
        id: string;
        parent: Row;
        column: string;
        expanded: boolean; // not sure if this is needed
        label: string;
        children: Array<Row>;
        obj: {
            t: string;
            p: string;
            k: string;
        };
        totals: { [index: string]: number };
    };
}

export interface Cell {
    obj: {
        t: string;
        p: string;
        k: string;
    };
    value: string;
    style?: GenericMap;
    options?: boolean;
    config?: any;
}

export interface TableData {
    columns?: Array<Column>;
    rows?: Array<Row>;
}

export interface GenericMap {
    [index: string]: string;
}

export interface SortObject {
    column: string;
    sortMode: SortMode;
}

export enum SortMode {
    A = 'A',
    D = 'D',
}

export interface TotalsMap {
    [index: string]: TotalMode;
}

export enum TotalMode {
    COUNT = 'Count',
    SUM = 'Sum',
    AVARAGE = 'Avarage',
}

export enum PaginatorPos {
    TOP = 'Top',
    BOTTOM = 'Bottom',
    BOTH = 'Both',
}

export interface GroupObject {
    column: string;
    visible: boolean;
}

export interface RowAction {
    text: string;
    icon: string;
}

export enum ShowGrid {
    NONE = 'None',
    ROW = 'Row',
    COL = 'Col',
    COMPLETE = 'Complete',
}

// export enum RowActionType {
//     DEFAULT = 'Default',
//     VARIABLE = 'Variable',
// }

export interface KupDataTableCellButtonClick {
    cell: Cell;
    column: Column;
    row: Row;
}

//---- *NEXT functionalit AKA load more ----
export enum LoadMoreMode {
    CONSTANT = 'constant',
    CONSTANT_INCREMENT = 'constant_increment',
    PROGRESSIVE_THRESHOLD = 'progressive_threshold',
}