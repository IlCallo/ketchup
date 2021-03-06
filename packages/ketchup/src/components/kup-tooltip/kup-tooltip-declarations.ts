import { DataTable } from "../kup-data-table/kup-data-table-declarations";

export interface TooltipData {
    image?: string;
    title?: string;
    content: {
        [index: string]: {
            label: string;
            value: string;
        };
    };
}

export interface TooltipAction {
    text: string;    
    icon: string;
    exec: string;
}

export interface TooltipDetailData extends DataTable {    
    actions?: {command: Array<TooltipAction>};
}
