import {Component, Event, EventEmitter, h, JSX, Method, Prop, State, Watch,} from '@stencil/core';

import numeral from 'numeral';

import {
  Cell,
  Column,
  GenericMap,
  GroupLabelDisplayMode,
  GroupObject,
  KupDataTableCellButtonClick,
  KupDataTableColumnDragType,
  KupDataTableSortedColumnIndexes,
  LoadMoreMode,
  PaginatorPos,
  Row,
  RowAction,
  RowGroup,
  ShowGrid,
  SortMode,
  SortObject,
  TableData,
  TotalsMap,
} from './kup-data-table-declarations';

import {
  calcTotals,
  filterRows,
  getColumnByName,
  groupRows,
  paginateRows,
  sortRows,
  styleHasBorderRadius,
} from './kup-data-table-helper';

import {progressbarFromCellHelper,} from "../kup-progress-bar/kup-progress-bar-helper";

import {
  createJ4objButtonConfig,
  isBar,
  isButton,
  isCheckbox,
  isIcon,
  isImage,
  isLink,
  isNumber,
  isProgressBar,
  isRadio,
  isVoCodver,
} from '../../utils/object-utils';

@Component({
    tag: 'kup-data-table',
    styleUrl: 'kup-data-table.scss',
    shadow: true,
})
export class KupDataTable {
    @Prop()
    columnsWidth: Array<{
        column: string;
        width: number;
    }> = [];

    @Prop() data: TableData;

    /**
     * Enables sorting of the columns by dragging them into different columns
     */
    @Prop() enableSortableColumns: boolean = false;

    @Prop()
    expandGroups = false;

    @Prop({ mutable: true })
    filters: GenericMap = {};

    /**
     * Forces cells with long text and a fixed column size to have an ellipsis set on their text.
     */
    @Prop({reflect: true})
    forceOneLine: boolean = true;

    @Prop()
    globalFilter = false;

    /**
     * How the label of a group must be displayed.
     * For available values [see here]{@link GroupLabelDisplayMode}
     */
    @Prop()
    groupLabelDisplay: GroupLabelDisplayMode = GroupLabelDisplayMode.BOTH;

    @Prop({ mutable: true })
    groups: Array<GroupObject> = [];

    /**
     * If table header is visible and this prop is set to true, the header will be visible while scrolling the table.
     * To make this work, it must be configured together with the data-table CSS property --kup-data-table_header-offset.
     * It uses CSS position: sticky.
     * @version 1.0
     * @namespace KupDataTable.headerIsPersistent
     * @see KupDataTable.showHeader
     * @see https://caniuse.com/#feat=css-sticky
     */
    @Prop({ reflect: true })
    headerIsPersistent = false;

    @Prop()
    multiSelection = false;

    /**
     * Sets a maximum limit of new records which can be required by the load more functionality.
     */
    @Prop() loadMoreLimit: number = 1000;

    /**
     * The number of records which will be requested to be downloaded when clicking on the load more button.
     *
     * This property is regulated also by loadMoreMode.
     * @see loadMoreMode
     * @see loadMoreLimit
     */
    @Prop() loadMoreStep: number = 60;

    /**
     * Establish the modality of how many new records will be downloaded.
     *
     * This property is regulated also by loadMoreStep.
     * @see loadMoreStep
     * @see loadMoreLimit
     */
    @Prop() loadMoreMode: LoadMoreMode = LoadMoreMode.PROGRESSIVE_THRESHOLD;

    @Prop()
    paginatorPos: PaginatorPos = PaginatorPos.TOP;

    @Prop()
    rowsPerPage = 10;

    @Prop()
    rowActions: Array<RowAction>;

    @Prop()
    selectRow: number;

    /**
     * Enables rendering of the table header.
     * @namespace KupDataTable.showHeader
     */
    @Prop({ reflect: true })
    showHeader = true;

    @Prop()
    showFilters = false;

    @Prop()
    showGrid: ShowGrid = ShowGrid.ROW;

    /**
     * If set to true, displays the button to load more records.
     */
    @Prop({ reflect: true }) showLoadMore: boolean = false;

    @Prop()
    sortEnabled = true;

    @Prop({ mutable: true })
    sort: Array<SortObject> = [];

    /**
     * If set to true, when a column is dragged to be sorted the component directly mutates the data.columns property
     * and then fires the event
     */
    @Prop() sortableColumnsMutateData: boolean = true;

    @Prop()
    totals: TotalsMap;

    //-------- State --------

    @State()
    private globalFilterValue = '';

    @State()
    private currentPage = 1;

    @State()
    private currentRowsPerPage = 10;

    @State()
    private selectedRows: Array<Row> = [];

    @State()
    private groupState: {
        [index: string]: {
            expanded: boolean;
        };
    } = {};

    /**
     * name of the column with an open menu
     */
    @State()
    private openedMenu: string = null;

    @State()
    private topFontSizePanelVisible = false;

    @State()
    private botFontSizePanelVisible = false;

    @State()
    private density: string = 'medium';

    @State()
    private fontsize: string = 'medium';

    @State()
    private topDensityPanelVisible = false;

    @State()
    private botDensityPanelVisible = false;

    @Watch('rowsPerPage')
    rowsPerPageHandler(newValue: number) {
        this.currentRowsPerPage = newValue;
    }

    @Watch('expandGroups')
    expandGroupsHandler() {
        // reset group state
        this.groupState = {};
        this.forceGroupExpansion();
    }

    @Watch('data')
    @Watch('sort')
    @Watch('filters')
    @Watch('globalFilterValue')
    @Watch('rowsPerPage')
    @Watch('groups')
    @Watch('totals')
    @Watch('currentPage')
    @Watch('currentRowsPerPage')
    recalculateRows() {
        this.initRows();
    }

    private rows: Array<Row>;

    private paginatedRows: Array<Row>;

    private footer: { [index: string]: number };

    private renderedRows: Array<Row> = [];

    private columnOverTimeout: NodeJS.Timeout;

    private loadMoreEventCounter: number = 0;

    private loadMoreEventPreviousQuantity: number = 0;

    /**
     * Internal not reactive state used to keep track if a column is being dragged.
     * @private
     */
    private columnsAreBeingDragged: boolean = false;

    /**
     * Attribute to set when a column is being dragged on the whole thead element
     * @const
     * @default 'columns-dragging'
     * @private
     */
    private dragFlagAttribute: string = 'columns-dragging';

    /**
     * The string representing the drag over attribute
     * @const
     * @default 'drag-over'
     * @private
     */
    private dragOverAttribute: string = 'drag-over';

    /**
     * The string representing the drag starter attribute to set onto the element
     * @const
     * @default 'drag-starter'
     * @private
     */
    private dragStarterAttribute: string = 'drag-starter';

    /**
     * Reference for the thead element
     * @private
     */
    private theadRef: HTMLTableSectionElement;

    /**
     * When a row is auto selected via selectRow prop
     */
    @Event({
        eventName: 'kupAutoRowSelect',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupAutoRowSelect: EventEmitter<{
        selectedRow: Row;
    }>;

    /**
     * When a row is selected
     */
    @Event({
        eventName: 'kupRowSelected',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupRowSelected: EventEmitter<{
        selectedRows: Array<Row>;
        clickedColumn: string;
    }>;

    /**
     * When cell option is clicked
     */
    @Event({
        eventName: 'kupOptionClicked',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupOptionClicked: EventEmitter<{
        column: string;
        row: Row;
    }>;

    /**
     * When 'add column' menu item is clicked
     */
    @Event({
        eventName: 'kupAddColumn',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupAddColumn: EventEmitter<{ column: string }>;

    /**
     * When a row action is clicked
     */
    @Event({
        eventName: 'kupRowActionClicked',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupRowActionClicked: EventEmitter<{
        type: 'default' | 'variable' | 'expander';
        row: Row;
        action?: RowAction;
        index?: number;
    }>;

    @Event({
        eventName: 'kupLoadMoreClicked',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupLoadMoreClicked: EventEmitter<{
        loadItems: number;
    }>;

    @Event({
        eventName: 'kupCellButtonClicked',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupCellButtonClicked: EventEmitter<KupDataTableCellButtonClick>;

    @Event({
        eventName: 'kupDataTableSortedColumn',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupDataTableSortedColumn: EventEmitter<KupDataTableSortedColumnIndexes>;

    /**
    * When a tooltip request initial data
    */
    @Event({
        eventName: 'kupLoadRequest',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupLoadRequest: EventEmitter<{
        cell: Cell,
        tooltip: EventTarget
    }>;

    /**
    * When a tooltip request detail data
    */
    @Event({
        eventName: 'kupDetailRequest',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupDetailRequest: EventEmitter<{
        cell: Cell,
        tooltip: EventTarget
    }>;

    onDocumentClick = () => {
        this.topFontSizePanelVisible = false;
        this.botFontSizePanelVisible = false;
        this.topDensityPanelVisible = false;
        this.botDensityPanelVisible = false;
    };



    // private theadObserver = new IntersectionObserver(
    //     (entries) => {
    //         entries.forEach((entry) => {
    //             if (entry.intersectionRatio === 1) {
    //                 // fully visible
    //                 console.log('fully visible', entry.target);
    //             } else if (entry.intersectionRatio === 0) {
    //                 // hidden
    //                 console.log('hidden', entry.target);
    //             }
    //         });
    //     },
    //     {
    //         threshold: [0, 0.5, 1],
    //         rootMargin: '-100px 0px 0px 0px',
    //     }
    // );

    // lifecycle
    componentWillLoad() {
        this.rowsPerPageHandler(this.rowsPerPage);
        this.initRows();

        if (this.expandGroups) {
            this.forceGroupExpansion();
        }
    }

    componentDidLoad() {
        document.addEventListener('click', this.onDocumentClick);

        // observing table
        // this.theadObserver.observe(this.theadRef);

        // automatic row selection
        if (this.selectRow && this.selectRow > 0) {
            if (this.selectRow <= this.renderedRows.length) {
                this.selectedRows = [];
                this.selectedRows.push(this.renderedRows[this.selectRow - 1]);
                this.kupAutoRowSelect.emit({
                    selectedRow: this.selectedRows[0],
                });
            }
        }
    }

    componentDidUnload() {
        document.removeEventListener('click', this.onDocumentClick);
    }

    private hasTooltip(cell: Cell) {
        return cell.obj
            && cell.obj.t!==""
            && !isBar(cell.obj)
            && !isButton(cell.obj)
            && !isCheckbox(cell.obj)
            && !isIcon(cell.obj)
            && !isImage(cell.obj)
            && !isLink(cell.obj)
            && !isNumber(cell.obj)
            && !isProgressBar(cell.obj)
            && !isRadio(cell.obj)
            && !isVoCodver(cell.obj);
    }

    private getColumns(): Array<Column> {
        return this.data && this.data.columns
            ? this.data.columns
            : [{ title: '', name: '', size: 0 }];
    }

    private getVisibleColumns(): Array<Column> {
        const visibleColumns = this.getColumns().filter((column) => {
            if (column.hasOwnProperty('visible')) {
                return column.visible;
            }

            return true;
        });

        // check grouping
        if (this.isGrouping()) {
            // filtering column based on group visibility
            return visibleColumns.filter((column) => {
                // check if in group
                let group = null;
                for (let currentGroup of this.groups) {
                    if (currentGroup.column === column.name) {
                        group = currentGroup;
                        break;
                    }
                }

                if (group) {
                    // return true if
                    // 1) group obj has not the 'visible' property or
                    // 2) group has 'visible' property and it is true
                    return !group.hasOwnProperty('visible') || group.visible;
                }

                // not in group -> visible
                return true;
            });
        }

        return visibleColumns;
    }

    private getGroupByName(column: string): GroupObject {
        if (!this.isGrouping()) {
            return null;
        }

        for (let group of this.groups) {
            if (group.column === column) {
                return group;
            }
        }

        return null;
    }

    private getRows(): Array<Row> {
        return this.data && this.data.rows ? this.data.rows : [];
    }

    private initRows(): void {
        this.filterRows();

        this.footer = calcTotals(this.rows, this.totals);

        this.groupRows();

        this.sortRows();

        this.paginatedRows = paginateRows(
            this.rows,
            this.currentPage,
            this.currentRowsPerPage
        );
    }

    private filterRows(): void {
        this.rows = filterRows(
            this.getRows(),
            this.filters,
            this.globalFilterValue,
            this.getVisibleColumns().map((c) => c.name)
        );
    }

    private isGrouping() {
        return this.groups && this.groups.length > 0;
    }

    private hasRowActions() {
        return this.rowActions !== undefined;
    }

    private removeGroup(group: GroupObject) {
        // resetting group state
        this.groupState = {};

        const index = this.groups.indexOf(group);

        if (index >= 0) {
            // removing group from prop
            this.groups.splice(index, 1);
            this.groups = [...this.groups];
        }
    }

    private removeGroupFromRow(group: RowGroup) {
        if (!group) {
            return;
        }

        // resetting group state
        this.groupState = {};

        // search group
        let index = -1;
        for (let i = 0; i < this.groups.length; i++) {
            const g = this.groups[i];

            if (g.column === group.column) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            // removing group from prop
            this.groups.splice(index, 1);
            this.groups = [...this.groups];
        }
    }

    private hasTotals() {
        return this.totals && Object.keys(this.totals).length > 0;
    }

    /**
     * Returns if the current data table must have the with set to auto to make table as large as the sum
     * of the table columns fixed width.
     * Table margin gets set to auto to center it.
     */
    private tableHasAutoWidth(): boolean {
        const visibleCols = this.getVisibleColumns();
        // Before checking each column, simply control that visible columns are at maximum as many as the custom columnsWidth items.
        // If there are more visible columns, it means that the width of the table will be set to auto.
        if (visibleCols.length <= this.columnsWidth.length) {
            let found = false;

            // Each visible column must have its own width for the table to have a auto width
            for (let i = 0; i < visibleCols.length; i++) {
                found = false;
                for (let j = 0; j < this.columnsWidth.length; j++) {
                    if (visibleCols[i].name === this.columnsWidth[j].column) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false
                }
            }
            return true;
        }
        return false;
    }

    private forceGroupExpansion() {
        this.rows.forEach((row) => this.forceRowGroupExpansion(row));
    }

    private forceRowGroupExpansion(row: Row) {
        // check if row is group
        if (!row.group) {
            return;
        }

        // forcing row expanded
        row.group.expanded = true;

        // updating group state
        // check if already present
        let groupState = this.groupState[row.group.id];
        if (!groupState) {
            groupState = {
                expanded: this.expandGroups,
            };
        } else {
            groupState.expanded = this.expandGroups;
        }

        this.groupState[row.group.id] = groupState;

        if (row.group.children) {
            row.group.children.forEach((childRow) =>
                this.forceRowGroupExpansion(childRow)
            );
        }
    }

    private adjustPaginator() {
        const numberOfRows = this.rows.length;

        // check if current page is valid
        const numberOfPages = Math.ceil(numberOfRows / this.currentRowsPerPage);
        if (this.currentPage > numberOfPages) {
            // reset page
            this.currentPage = 1;
        }
    }

    // event listeners
    private onColumnSort({ ctrlKey }: MouseEvent, columnName: string) {
        // check if columnName is already in sort array
        let i = 0;
        for (; i < this.sort.length; i++) {
            const sortObj = this.sort[i];
            if (sortObj.column === columnName) {
                break;
            }
        }

        if (i < this.sort.length) {
            // already in array... switching sort
            const sortObj = this.sort[i];

            const newSortObj: SortObject = {
                ...sortObj,
                sortMode:
                    sortObj.sortMode === SortMode.A ? SortMode.D : SortMode.A,
            };

            if (ctrlKey) {
                const newSort = [...this.sort];
                newSort[i] = newSortObj;
                this.sort = newSort;
            } else {
                this.sort = [newSortObj];
            }
        } else {
            const sortObj: SortObject = {
                column: columnName,
                sortMode: SortMode.A,
            };

            // if CTRL is pressed, push to array
            // else, replace current array
            if (ctrlKey) {
                this.sort = [...this.sort, sortObj];
            } else {
                this.sort = [sortObj];
            }
        }
    }

    private onFilterChange({ detail }, column: string) {
        // resetting current page
        this.currentPage = 1;

        const newFilters = { ...this.filters };
        if (detail.value.length === 0) {
            delete newFilters[column];
        } else {
            newFilters[column] = detail.value;
        }

        this.filters = newFilters;
    }

    private onGlobalFilterChange({ detail }) {
        // resetting current page
        this.currentPage = 1;

        this.globalFilterValue = detail.value;
    }

    private handlePageChanged({ detail }) {
        this.currentPage = detail.newPage;
    }

    private handleRowsPerPageChanged({ detail }) {
        this.currentRowsPerPage = detail.newRowsPerPage;
        this.adjustPaginator();
    }

    private onRowClick(event: MouseEvent, row: Row) {
        // selecting row
        this.handleRowSelect(row, event.ctrlKey);

        // checking target
        const target = event.target;

        let clickedColumn: string = null;
        if (target instanceof HTMLElement) {
            if (target.tagName !== 'TR') {
                let currentElement = target;
                while (currentElement.tagName !== 'TD') {
                    currentElement = currentElement.parentElement;
                }

                clickedColumn = currentElement.dataset.column;
            }
        }

        this.kupRowSelected.emit({
            selectedRows: this.selectedRows,
            clickedColumn,
        });
    }

    private onDefaultRowActionClick(
        e: MouseEvent,
        { action, row, type, index }
    ) {
        e.stopPropagation();

        this.kupRowActionClicked.emit({
            action,
            index,
            row,
            type,
        });
    }

    private onRowActionExpanderClick(e: MouseEvent, row: Row) {
        e.stopPropagation();

        this.kupRowActionClicked.emit({
            row,
            type: 'expander',
        });
    }

    private handleRowSelect(row: Row, ctrlKey: boolean) {
        if (this.multiSelection) {
            if (ctrlKey && this.selectedRows) {
                const index = this.selectedRows.indexOf(row);

                if (index < 0) {
                    // adding
                    this.selectedRows = [...this.selectedRows, row];
                } else {
                    // removing
                    this.selectedRows.splice(index, 1);
                    this.selectedRows = [...this.selectedRows];
                }
            } else {
                this.selectedRows = [row];
            }
        } else {
            this.selectedRows = [row];
        }
    }

    private onRowCheckboxSelection({ target }, row: Row) {
        if (target.checked) {
            if (this.selectedRows.length > 0) {
                this.selectedRows = [...this.selectedRows, row];
            } else {
                this.selectedRows = [row];
            }
        } else {
            const index = this.selectedRows.indexOf(row);

            if (index >= 0) {
                this.selectedRows.splice(index, 1);
                this.selectedRows = [...this.selectedRows];
            }
        }

        this.kupRowSelected.emit({
            selectedRows: this.selectedRows,
            clickedColumn: null,
        });
    }

    private onRowExpand(row: Row) {
        // row should be a 'group' row
        row.group.expanded = !row.group.expanded;

        // updating group map
        this.groupState[row.group.id].expanded = row.group.expanded;

        // changing group state to trigger rendering
        this.groupState = { ...this.groupState };
    }

    private onSelectAll({ target }) {
        if (target.checked) {
            // select all rows
            this.selectedRows = this.renderedRows;
        } else {
            // deselect all rows
            this.selectedRows = [];
        }

        // triggering event
        this.kupRowSelected.emit({
            selectedRows: this.selectedRows,
            clickedColumn: null,
        });
    }

    private onColumnMouseEnter(column: string) {
        this.columnOverTimeout = setTimeout(() => {
            this.openedMenu = column;
        }, 500);
    }

    private onColumnMouseLeave(column: string) {
        // clearing timeout
        clearTimeout(this.columnOverTimeout);

        if (this.openedMenu === column) {
            this.openedMenu = null;
        }
    }

    private switchColumnGroup(group: GroupObject, column: string) {
        // resetting opened menu
        this.openedMenu = null;

        // reset group state
        this.groupState = {};

        if (group !== null) {
            // remove from grouping
            const index = this.groups.indexOf(group);
            this.groups.splice(index, 1);
            this.groups = [...this.groups];
        } else {
            // add to groups
            this.groups = [...this.groups, { column, visible: true }];
        }
    }

    private onOptionClicked(column: string, row: Row) {
        this.kupOptionClicked.emit({
            column,
            row,
        });
    }

    private onJ4btnClicked(row, column, cell) {
        // Since this function is called with bind, the event from the kup-button gets passed into the arguments array
        const buttonEvent = arguments[3] as UIEvent;
        if (buttonEvent) {
            // Prevents double events to be fired.
            buttonEvent.stopPropagation();
        } else {
            throw 'kup-data-table error: missing event';
        }
        this.kupCellButtonClicked.emit({
            cell,
            column,
            row,
        });
    }

    // utility methods
    private groupRows(): void {
        if (!this.isGrouping()) {
            return;
        }

        this.rows = groupRows(
            this.getColumns(),
            this.rows,
            this.groups,
            this.totals
        );

        this.adjustGroupState();
    }

    // Handler for loadMore button is clicked.
    private onLoadMoreClick() {
        let loadItems: number = 0;

        switch (this.loadMoreMode) {
            case LoadMoreMode.CONSTANT:
                loadItems = this.loadMoreStep;
                break;
            case LoadMoreMode.CONSTANT_INCREMENT:
                loadItems = this.loadMoreStep * (this.loadMoreEventCounter + 1);
                break;
            case LoadMoreMode.PROGRESSIVE_THRESHOLD:
                loadItems =
                    Math.max(
                        this.loadMoreEventPreviousQuantity,
                        this.loadMoreStep
                    ) * Math.min(this.loadMoreEventCounter + 1, 2);
                break;
        }

        if (loadItems > this.loadMoreLimit) {
            loadItems = this.loadMoreLimit;
        }

        this.kupLoadMoreClicked.emit({
            loadItems,
        });

        this.loadMoreEventPreviousQuantity = loadItems;
        this.loadMoreEventCounter++;
    }

    private adjustGroupState(): void {
        if (
            !this.rows ||
            this.rows.length === 0 ||
            !this.rows[0].hasOwnProperty('group')
        ) {
            // no grouping
            return;
        }

        this.rows.forEach((r) => this.adjustGroupStateFromRow(r));
    }

    private adjustGroupStateFromRow(row: Row): void {
        if (!row || !row.hasOwnProperty('group')) {
            // not a groping row, nothing to do
            return;
        }

        const group = row.group;

        // check if already in group state
        let groupFromState = this.groupState[group.id];

        if (!groupFromState) {
            // add to state
            this.groupState[group.id] = group;
        } else {
            // update expanded
            group.expanded = groupFromState.expanded;
        }

        group.children.forEach((child) => this.adjustGroupStateFromRow(child));
    }

    private sortRows(): void {
        this.rows = sortRows(this.rows, this.sort);
    }

    private getSortIcon(columnName: string): string {
        // check if column in sort array
        for (let sortObj of this.sort) {
            if (sortObj.column === columnName) {
                return 'A' === sortObj.sortMode
                    ? 'mdi-sort-ascending'
                    : 'mdi-sort-descending';
            }
        }

        // default
        return 'mdi-sort';
    }

    private calculateColspan() {
        let colSpan = this.getVisibleColumns().length;

        if (this.multiSelection) {
            colSpan += 1;
        }

        if (this.isGrouping() && this.hasTotals()) {
            colSpan += 1;
        }

        if (this.hasRowActions()) {
            colSpan += 1;
        }

        return colSpan;
    }

    private isGroupExpanded({ group }: Row): boolean {
        if (!group) {
            return false;
        }

        // check if in group state
        if (this.groupState[group.id]) {
            return this.groupState[group.id].expanded;
        } else {
            return false;
        }
    }

    //==== Column sort order methods ====
    private handleColumnSort(receivingColumn: Column, sortedColumn: Column) {
        // Get receiving column position
        const receivingColIndex = this.data.columns.findIndex(
            (col) =>
                col.name === receivingColumn.name &&
                col.title === receivingColumn.title
        );
        // Get sorted column current position
        const sortedColIndex = this.data.columns.findIndex(
            (col) =>
                col.name === sortedColumn.name &&
                col.title === sortedColumn.title
        );

        // Moves the sortedColumn into the correct position
        if (this.sortableColumnsMutateData) {
            this.moveSortedColumns(
                this.data.columns,
                receivingColIndex,
                sortedColIndex
            );
        }
        // fires event
        this.kupDataTableSortedColumn.emit({
            receivingColumnIndex: receivingColIndex,
            sortedColumnIndex: sortedColIndex,
        });
    }

    private moveSortedColumns(
        columns: Column[],
        receivingColumnIndex: number,
        sortedColumnIndex: number
    ) {
        const remove = columns.splice(sortedColumnIndex, 1);
        columns.splice(receivingColumnIndex, 0, remove[0]);
    }

    @Method() async defaultSortingFunction(
        columns: Column[],
        receivingColumnIndex: number,
        sortedColumnIndex: number,
        useNewObject: boolean = false
    ) {
        const toSort = !useNewObject ? columns : [...columns];

        this.moveSortedColumns(toSort, receivingColumnIndex, sortedColumnIndex);

        return toSort;
    }

    private toggleFontSizeVisibility(event: MouseEvent, top: boolean) {
        event.stopPropagation();
        if (top) {
            this.topFontSizePanelVisible = !this.topFontSizePanelVisible;
            this.botFontSizePanelVisible = false;
        } else {
            this.topFontSizePanelVisible = false;
            this.botFontSizePanelVisible = !this.botFontSizePanelVisible;
        }
    }

    private toggleDensityVisibility(event: MouseEvent, top: boolean) {
        event.stopPropagation();
        if (top) {
            this.topDensityPanelVisible = !this.topDensityPanelVisible;
            this.botDensityPanelVisible = false;
        } else {
            this.topDensityPanelVisible = false;
            this.botDensityPanelVisible = !this.botDensityPanelVisible;
        }
    }

    //======== render methods ========
    private renderHeader() {
        const hasCustomColumnsWidth = this.columnsWidth.length > 0;

        const dataColumns = this.getVisibleColumns().map((column) => {
            // filter
            let filter = null;
            if (this.showFilters) {
                let filterValue = '';
                if (this.filters && this.filters[column.name]) {
                    filterValue = this.filters[column.name];
                }

                filter = (
                    <div>
                        <kup-text-input
                            class="datatable-filter"
                            initialValue={filterValue}
                            data-col={column.name}
                            onKetchupTextInputUpdated={(e) => {
                                this.onFilterChange(e, column.name);
                            }}
                        />
                    </div>
                );
            }

            // sort
            let sort = null;
            if (this.sortEnabled) {
                sort = (
                    <span class="column-sort">
                        <span
                            role="button"
                            aria-label="Sort column" // TODO
                            class={'mdi ' + this.getSortIcon(column.name)}
                            onClick={(e: MouseEvent) =>
                                this.onColumnSort(e, column.name)
                            }
                        />
                    </span>
                );
            }

            let thStyle = null;
            if (hasCustomColumnsWidth) {
                for (let i = 0; i < this.columnsWidth.length; i++) {
                    const currentCol = this.columnsWidth[i];

                    if (currentCol.column === column.name) {
                        const width = currentCol.width.toString() + 'px';
                        thStyle = {
                            width,
                            minWidth: width,
                            maxWidth: width,
                        };
                        break;
                    }
                }
            }

            const columnMenuItems: JSX.Element[] = [];

            // adding grouping
            const group = this.getGroupByName(column.name);
            const groupLabel =
                group != null
                    ? 'Disattiva raggruppamento'
                    : 'Attiva raggruppamento';

            columnMenuItems.push(
                <li
                    role="menuitem"
                    onClick={() => this.switchColumnGroup(group, column.name)}
                >
                    <span class="mdi mdi-book" />
                    {groupLabel}
                </li>
            );

            columnMenuItems.push(
                <li
                    role="menuitem"
                    onClick={() =>
                        this.kupAddColumn.emit({ column: column.name })
                    }
                >
                    <span class="mdi mdi-table-column-plus-after" />
                    Aggiungi colonna
                </li>
            );

            let columnMenu = null;
            if (columnMenuItems.length !== 0) {
                const menuClass =
                    this.openedMenu === column.name ? 'open' : 'closed';

                columnMenu = (
                    <div class={`column-menu ${menuClass}`}>
                        <ul role="menubar">{columnMenuItems}</ul>
                    </div>
                );
            }

            // Check if columns are droppable and sets their handlers
            // TODO set better typing.
            let dragHandlers: any = {};
            if (this.enableSortableColumns) {
                // Reference for drag events and what they permit or not
                // https://html.spec.whatwg.org/multipage/dnd.html#concept-dnd-p

                dragHandlers = {
                    draggable: true,
                    onDragStart: (e: DragEvent) => {
                        // Sets drag data and the type of drag
                        e.dataTransfer.setData(
                            KupDataTableColumnDragType,
                            JSON.stringify(column)
                        );
                        e.dataTransfer.effectAllowed = 'move';

                        // Remember that the current target is different from the one print out in the console
                        // Sets which element has started the drag
                        (e.target as HTMLElement).setAttribute(
                            this.dragStarterAttribute,
                            ''
                        );
                        this.theadRef.setAttribute(this.dragFlagAttribute, '');
                        this.columnsAreBeingDragged = true;
                    },
                    onDragLeave: (e: DragEvent) => {
                        if (
                            e.dataTransfer.types.indexOf(
                                KupDataTableColumnDragType
                            ) >= 0
                        ) {
                            (e.target as HTMLElement).removeAttribute(
                                this.dragOverAttribute
                            );
                        }
                    },
                    onDragOver: (e: DragEvent) => {
                        if (
                            e.dataTransfer.types.indexOf(
                                KupDataTableColumnDragType
                            ) >= 0
                        ) {
                            const overElement = e.target as HTMLElement;
                            overElement.setAttribute(
                                this.dragOverAttribute,
                                ''
                            );
                            // If element can have a drop effect
                            if (
                                !overElement.hasAttribute(
                                    this.dragStarterAttribute
                                ) &&
                                this.columnsAreBeingDragged
                            ) {
                                e.preventDefault(); // Mandatory to allow drop
                                e.dataTransfer.effectAllowed = 'move';
                            } else {
                                e.dataTransfer.effectAllowed = 'none';
                            }
                        }
                    },
                    onDragEnd: (e: DragEvent) => {
                        // When the drag has ended, checks if the element still exists or it was destroyed by the JSX
                        const dragStarter = e.target as HTMLElement;
                        if (dragStarter) {
                            // IF it still exists, removes the attribute so that it can perform a new drag again
                            dragStarter.removeAttribute(
                                this.dragStarterAttribute
                            );
                        }
                        this.theadRef.removeAttribute(this.dragFlagAttribute);
                        this.columnsAreBeingDragged = false;
                    },
                    onDrop: (e: DragEvent) => {
                        if (
                            e.dataTransfer.types.indexOf(
                                KupDataTableColumnDragType
                            ) >= 0
                        ) {
                            const transferredData = JSON.parse(
                                e.dataTransfer.getData(
                                    KupDataTableColumnDragType
                                )
                            ) as Column;
                            e.preventDefault();
                            (e.target as HTMLElement).removeAttribute(
                                this.dragOverAttribute
                            );

                            // We are sure the tables have been dropped in a valid location -> starts sorting the columns
                            this.handleColumnSort(column, transferredData);
                        }
                    },
                };
            }

            return (
                <th
                    style={thStyle}
                    onMouseEnter={() => this.onColumnMouseEnter(column.name)}
                    onMouseLeave={() => this.onColumnMouseLeave(column.name)}
                    {...dragHandlers}
                >
                    <span class="column-title">{column.title}</span>
                    {sort}
                    {filter}
                    {columnMenu}
                </th>
            );
        });

        let multiSelectColumn = null;
        if (this.multiSelection) {
            const style = {
                width: '30px',
                margin: '0 auto',
            };
            multiSelectColumn = (
                <th style={style}>
                    <input
                        type="checkbox"
                        onChange={(e) => this.onSelectAll(e)}
                        title={`selectedRow: ${this.selectedRows.length} - renderedRows: ${this.renderedRows.length}`}
                        checked={
                            this.selectedRows.length > 0 &&
                            this.selectedRows.length ===
                                this.renderedRows.length
                        }
                    />
                </th>
            );
        }

        let groupColumn = null;
        if (this.isGrouping() && this.hasTotals()) {
            groupColumn = <th />;
        }

        let actionsColumn = null;
        if (this.hasRowActions()) {
            actionsColumn = <th />;
        }

        return [multiSelectColumn, groupColumn, actionsColumn, ...dataColumns];
    }

    renderFooter() {
        if (!this.hasTotals()) {
            // no footer
            return null;
        }

        const footerCells = this.getVisibleColumns().map(({ name }) => (
            <td>{this.footer[name]}</td>
        ));

        let selectRowCell = null;
        if (this.multiSelection) {
            selectRowCell = <td />;
        }

        let groupingCell = null;
        if (this.isGrouping() && this.hasTotals()) {
            groupingCell = <td />;
        }

        const footer = (
            <tfoot>
                <tr>
                    {selectRowCell}
                    {groupingCell}
                    {footerCells}
                </tr>
            </tfoot>
        );

        return footer;
    }

    private renderRow(row: Row, level = 0, previousRow?: Row) {
        const visibleColumns = this.getVisibleColumns();

        if (row.group) {
            // Composes the label the group must display
            let composedGroupLabel: string;
            switch (this.groupLabelDisplay) {
                case GroupLabelDisplayMode.LABEL:
                    composedGroupLabel = row.group.columnLabel;
                    break;
                case GroupLabelDisplayMode.VALUE:
                    composedGroupLabel = row.group.label;
                    break;
                case GroupLabelDisplayMode.BOTH:
                default:
                    composedGroupLabel = row.group.columnLabel + ' = ' + row.group.label;
                    break;
            }

            if (row.group.children.length === 0) {
                // empty group
                return null;
            }

            const icon = row.group.expanded ? (
                <path d="M19,13H5V11H19V13Z" />
            ) : (
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            );

            const jsxRows = [];

            let indent = [];
            for (let i = 0; i < level; i++) {
                indent.push(<span class="indent" />);
            }

            if (this.hasTotals()) {
                const cells = [];

                // adding 'grouping' cell
                const colSpan = this.multiSelection ? 2 : 1;
                cells.push(
                    <td colSpan={colSpan}>
                        {indent}
                        <span class="group-cell-content">
                            <span
                                role="button"
                                aria-label="Row expander" // TODO change this label
                                title="Expand/collapse group"
                                tabindex="0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.onRowExpand(row);
                                }}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    class="group-expander"
                                >
                                    {icon}
                                </svg>
                            </span>
                            <span class="text">{composedGroupLabel}</span>
                            <span
                                role="button"
                                aria-label="Remove group" // TODO change this label
                                title="Remove group"
                                tabindex="0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.removeGroupFromRow(row.group);
                                }}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    class="group-remove"
                                >
                                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                                </svg>
                            </span>
                        </span>
                    </td>
                );

                for (let column of visibleColumns) {
                    cells.push(
                        <td class="total">{row.group.totals[column.name]}</td>
                    );
                }

                jsxRows.push(
                    <tr class="group" onClick={() => this.onRowExpand(row)}>
                        {cells}
                    </tr>
                );
            } else {
                jsxRows.push(
                    <tr class="group" onClick={() => this.onRowExpand(row)}>
                        <td colSpan={this.calculateColspan()}>
                            {indent}
                            <span class="group-cell-content">
                                <span
                                    role="button"
                                    aria-label="Row expander" // TODO change this label
                                    title="Expand/collapse group"
                                    tabindex="0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.onRowExpand(row);
                                    }}
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        class="group-expander"
                                    >
                                        {icon}
                                    </svg>
                                </span>
                                <span class="text">{composedGroupLabel}</span>
                                <span
                                    role="button"
                                    aria-label="Remove group" // TODO change this label
                                    title="Remove group"
                                    tabindex="0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.removeGroupFromRow(row.group);
                                    }}
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        class="group-remove"
                                    >
                                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                                    </svg>
                                </span>
                            </span>
                        </td>
                    </tr>
                );
            }

            // if group is expanded, add children
            if (this.isGroupExpanded(row)) {
                row.group.children
                    // We must pass the previous element of the array to check if we must hide or display the value of the cell
                    // When the column has specified the parameter hideValuesRepetitions
                    .map((row, groupRowIndex, currentArray) =>
                        this.renderRow(
                            row,
                            level + 1,
                            groupRowIndex > 0
                                ? currentArray[groupRowIndex - 1]
                                : null
                        )
                    )
                    .forEach((jsxRow) => {
                        if (Array.isArray(jsxRow)) {
                            jsxRow.forEach((jr) => jsxRows.push(jr));
                        } else {
                            jsxRows.push(jsxRow);
                        }
                    });
            }

            // grouping row
            return jsxRows;
        } else {
            const cells = visibleColumns.map((currentColumn, index) => {
                const { name, hideValuesRepetitions } = currentColumn;
                let indend = [];
                if (index === 0 && !(this.isGrouping() && this.hasTotals())) {
                    for (let i = 0; i < level; i++) {
                        indend.push(<span class="indent" />);
                    }
                }

                const cell = row.cells[name];

                let options = null;
                /**
                 * Options must be rendered when the option field is specified AND (one of the following):
                 * 1 - Column do not have to hide repetitions
                 * 2 - Column has to hide repetitions but we are printing the first row.
                 * 3 - Column has to hide repetitions but the value of the previous row is not equal to the current row cell.
                 * @todo Move this rendering, if possible, inside renderCell()
                 */
                if (
                    cell.options &&
                    (!hideValuesRepetitions ||
                        (hideValuesRepetitions &&
                            (!previousRow ||
                                previousRow.cells[name].value !== cell.value)))
                ) {
                    options = (
                        <span
                            class="options"
                            role="button"
                            aria-label="Opzioni oggetto"
                            title="Opzioni oggetto"
                            onClick={() => this.onOptionClicked(name, row)}
                        >
                            <i class="mdi mdi-settings" />
                        </span>
                    );
                }

                const jsxCell = this.renderCell(
                    cell,
                    name,
                    // The previous value must be passed only if repeated values can be hidden and we have a previous row.
                    {
                        row,
                        column: currentColumn,
                    },
                    !!hideValuesRepetitions,
                    hideValuesRepetitions && previousRow
                        ? previousRow.cells[name].value
                        : null
                );

                const cellClass = {
                    number: isNumber(cell.obj),
                };

                let cellStyle = null;
                if (!styleHasBorderRadius(cell)) {
                    cellStyle = cell.style;
                }

                // Controls if there are columns with a specified width
                if (this.columnsWidth && this.columnsWidth.length) {
                    let colWidth: string = '';

                    // Search if this column has a specified width
                    for (let j = 0; j < this.columnsWidth.length; j++) {
                        if (name === this.columnsWidth[j].column) {
                            colWidth = this.columnsWidth[j].width + 'px';
                            break;
                        }
                    }

                    // Specific width has been found
                    if (colWidth) {
                        if (!cellStyle) {
                          cellStyle = {};
                        }

                        // Sets the width.
                        // Search for "auto-width" class inside the scss file of this component for more details about this
                        cellStyle['max-width'] = colWidth;
                        cellStyle['min-width'] = colWidth;
                    }
                }

                return (
                    <td data-column={name} style={cellStyle} class={cellClass}>
                        {indend}
                        {jsxCell}
                        {options}
                    </td>
                );
            });

            let selectRowCell = null;
            if (this.multiSelection) {
                selectRowCell = (
                    <td>
                        <input
                            type="checkbox"
                            checked={this.selectedRows.includes(row)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                this.onRowCheckboxSelection(e, row)
                            }
                        />
                    </td>
                );
            }

            let groupingCell = null;
            if (this.isGrouping() && this.hasTotals()) {
                groupingCell = <td />;
            }

            // adding row to rendered rows
            this.renderedRows.push(row);

            let rowActionsCell = null;
            if (this.hasRowActions()) {
                const defaultRowActions = this.renderActions(
                    this.rowActions,
                    row,
                    'default'
                );

                let rowActionExpander = null;
                let variableActions = null;
                if (row.actions) {
                    // adding variable actions
                    variableActions = this.renderActions(
                        row.actions,
                        row,
                        'variable'
                    );
                } else {
                    // adding expander
                    rowActionExpander = (
                        <span
                            title="Espandi voci"
                            class={`row-action mdi mdi-chevron-right`}
                            onClick={(e) =>
                                this.onRowActionExpanderClick(e, row)
                            }
                            role="button"
                            aria-label="Espandi voci"
                        />
                    );
                }

                rowActionsCell = (
                    <td>
                        {defaultRowActions}
                        {rowActionExpander}
                        {variableActions}
                    </td>
                );
            }

            const rowClass = {
                selected: this.selectedRows.includes(row),
            };

            return (
                <tr class={rowClass} onClick={(e) => this.onRowClick(e, row)}>
                    {selectRowCell}
                    {groupingCell}
                    {rowActionsCell}
                    {cells}
                </tr>
            );
        }
    }

    private renderActions(
        actions: Array<RowAction>,
        row: Row,
        type: string
    ): JSX.Element[] {
        return actions.map((action, index) => {
            return (
                <span
                    title={action.text}
                    class={`row-action ${action.icon}`}
                    onClick={(e) =>
                        this.onDefaultRowActionClick(e, {
                            action,
                            index,
                            row,
                            type,
                        })
                    }
                    role="button"
                    aria-label={action.text}
                />
            );
        });
    }

    /**
     * FActory function for cells.
     * @param cell - cell object
     * @param column - the cell's column name
     * @param previousRowCellValue - An optional value of the previous cell on the same column. If set and equal to the value of the current cell, makes the value of the current cell go blank.
     * @param cellData - Additional data for the current cell.
     * @param cellData.column - The column object to which the cell belongs.
     * @param cellData.row - The row object to which the cell belongs.
     */
    private renderCell(
        cell: Cell,
        column: string,
        cellData: {
            column: Column;
            row: Row;
        },
        hideValuesRepetition: boolean = false,
        previousRowCellValue?: string
    ) {
        const clazz = {
            'cell-content': true,
        };

        // When the previous row value is different from the current value, we can show the current value.
        const valueToDisplay =
            previousRowCellValue !== cell.value ? cell.value : '';

        // Sets the default value
        let content: any = valueToDisplay;

        if (isIcon(cell.obj) || isVoCodver(cell.obj)) {
            content = <span class={valueToDisplay} />;
        } else if (isNumber(cell.obj)) {
            content = valueToDisplay;

            if (content) {
                const cellValue = numeral(cell.obj.k).value();

                if (cellValue < 0) {
                    clazz['negative-number'] = true;
                }
            }
        } else if (isImage(cell.obj)) {
            content = <img src={valueToDisplay} alt="" class="cell-image"/>;
        } else if (isLink(cell.obj)) {
            content = (
                <a href={valueToDisplay} target="_blank">
                    {valueToDisplay}
                </a>
            );
        } else if (isCheckbox(cell.obj)) {
            content = (
                <kup-checkbox
                    checked={!!cell.obj.k}
                    disabled={
                        cellData &&
                        cellData.row &&
                        cellData.row.hasOwnProperty('readOnly')
                            ? cellData.row.readOnly
                            : true
                    }
                />
            );
        } else if (isButton(cell.obj)) {
            /**
             * Here either using .bind() or () => {} function would bring more or less the same result.
             * Both those syntax would create at run time a new function for each cell on which they're rendered.
             * (See references below.)
             *
             * Another solution would be to simply bind an event handler like this:
             * onKupButtonClicked={this.onJ4btnClicked}
             *
             * The problem here is that, by using that syntax:
             * 1 - Each time a cell is rendered with an object item, either the cell or button must have a data-row,
             *      data-column and data-cell-name attributes which stores the index of cell's and the name of the clicked cell;
             * 2 - each time a click event is triggered, the handler reads the row and column index set on the element;
             * 3 - searches those column and row inside the current data for the table;
             * 4 - once the data is found, creates the custom event with the data to be sent.
             *
             * Currently there is no reason to perform such a search, but it may arise if on large data tables
             * there is a significant performance loss.
             * @see https://reactjs.org/docs/handling-events.html
             */
            content = (
                <kup-button
                    {...createJ4objButtonConfig(cell)}
                    onKupButtonClicked={this.onJ4btnClicked.bind(
                        this,
                        cellData ? cellData.row : null,
                        cellData ? cellData.column : null,
                        cell
                    )}
                />
            );
        } else if (isBar(cell.obj)) {
            const props: { value: string; width?: number } = {
                value: cell.value,
            };

            // check if column has width
            if (this.columnsWidth && this.columnsWidth[column]) {
                props.width = this.columnsWidth[column];
            }

            // Controls if we should display this cell value
            content = !hideValuesRepetition || valueToDisplay ? <kup-graphic-cell {...props} /> : null;
        } else if (isProgressBar(cell.obj)) {
          if (!hideValuesRepetition || valueToDisplay) {
            content = progressbarFromCellHelper(
              cell,
              valueToDisplay,
              true
            );
          } else {
            content = null;
          }
        } else if (isRadio(cell.obj)) {
          if (!hideValuesRepetition || valueToDisplay) {
            content = <kup-radio-element
              checked={!!cell.obj.k}
              disabled={
                cellData &&
                cellData.row &&
                cellData.row.hasOwnProperty('readOnly')
                  ? cellData.row.readOnly
                  : true
              }
            />;
          } else {
            content = null;
          }
        }

        // if cell.style has border, apply style to cellcontent
        let style = null;
        if (styleHasBorderRadius(cell)) {
            style = cell.style;
        }

        /**
         * Controls if current cell needs a tooltip and eventually adds it.
         * @todo When the option forceOneLine is active, there is a problem with the current implementation of the tooltip. See documentation in the mauer wiki for better understanding.
         */
        if (this.hasTooltip(cell)) {
            content = <kup-tooltip onKupTooltipLoadData={(ev) => this.kupLoadRequest.emit(
                {
                    cell: cell,
                    tooltip: ev.srcElement
                }
            )} onKupTooltipLoadDetail={(ev) => this.kupDetailRequest.emit(
                {
                    cell: cell,
                    tooltip: ev.srcElement
                }
            )} >{content}</kup-tooltip>;
        }

        return (
            <span class={clazz} style={style}>
                {content}
            </span>
        );
    }

    private renderLoadMoreButton(isSlotted: boolean = true) {
        const label = 'Mostra altri dati';
        return (
            <button
                aria-label={label}
                class="loadmore-panel loadmore-icon mdi mdi-plus"
                role="button"
                slot={isSlotted ? 'more-results' : null}
                tabindex="0"
                title={label}
                onClick={() => this.onLoadMoreClick()}
            />
        );
    }

    private renderPaginator(top: boolean) {
        return (
            <div class="paginator-wrapper">
                <kup-paginator
                    id={top ? 'top-paginator' : 'bottom-paginator'}
                    max={this.rows.length}
                    perPage={this.rowsPerPage}
                    selectedPerPage={this.currentRowsPerPage}
                    currentPage={this.currentPage}
                    onKupPageChanged={(e) => this.handlePageChanged(e)}
                    onKupRowsPerPageChanged={(e) =>
                        this.handleRowsPerPageChanged(e)
                    }
                ></kup-paginator>
                {this.renderDensityPanel(top)}
                {this.renderFontSizePanel(top)}
                {this.showLoadMore ? this.renderLoadMoreButton() : null}
            </div>
        );
    }

    private renderFontSizePanel(top: boolean) {
        let fontSize;
        {
            this.fontsize === 'medium'
                ? (fontSize = 'Medio')
                : this.fontsize === 'big'
                ? (fontSize = 'Grande')
                : this.fontsize === 'small'
                ? (fontSize = 'Piccolo')
                : (fontSize = '');
        }
        let fontSizeTypeString = 'Dimensione carattere: ' + fontSize;
        return (
            <div class="fontsize-panel">
                <span
                    title={fontSizeTypeString}
                    class="fontsize-icon mdi mdi-format-size"
                ></span>
                <span
                    class="fontsize-label"
                    onClick={(e) => this.toggleFontSizeVisibility(e, top)}
                >
                    {fontSize}
                </span>
                <div
                    role="button"
                    onClick={(e) => this.toggleFontSizeVisibility(e, top)}
                    tabindex="0"
                >
                    <svg
                        version="1.1"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path d="M7,10L12,15L17,10H7Z" />
                    </svg>
                </div>
                <div
                    class={{
                        'fontsize-panel-overlay': true,
                        open: top
                            ? this.topFontSizePanelVisible
                            : this.botFontSizePanelVisible,
                    }}
                >
                    <div
                        class={{
                            wrapper: true,
                            active: this.fontsize === 'small',
                        }}
                        onClick={() => (this.fontsize = 'small')}
                        role="button"
                        tabindex="0"
                        aria-pressed={
                            this.fontsize === 'small' ? 'true' : 'false'
                        }
                    >
                        <span
                            title="Piccolo"
                            class="fontsize-icon-panel mdi mdi-format-font-size-decrease"
                        ></span>
                    </div>

                    <div
                        class={{
                            wrapper: true,
                            active: this.fontsize === 'medium',
                        }}
                        onClick={() => (this.fontsize = 'medium')}
                        role="button"
                        tabindex="0"
                        aria-pressed={
                            this.fontsize === 'medium' ? 'true' : 'false'
                        }
                    >
                        <span
                            title="Normale"
                            class="fontsize-icon-panel mdi mdi-format-color-text"
                        ></span>
                    </div>
                    <div
                        class={{
                            wrapper: true,
                            active: this.fontsize === 'big',
                        }}
                        onClick={() => (this.fontsize = 'big')}
                        role="button"
                        tabindex="0"
                        aria-pressed={
                            this.fontsize === 'big' ? 'true' : 'false'
                        }
                    >
                        <span
                            title="Grande"
                            class="fontsize-icon-panel mdi mdi-format-font-size-increase"
                        ></span>
                    </div>
                </div>
            </div>
        );
    }

    private renderDensityPanel(top: boolean) {
        let densityType;
        {
            this.density === 'medium'
                ? (densityType = 'Normale')
                : this.density === 'big'
                ? (densityType = 'Ampia')
                : this.density === 'small'
                ? (densityType = 'Compatta')
                : (densityType = '');
        }
        let densityTypeString = 'Spaziatura righe: ' + densityType;
        return (
            <div class="density-panel">
                <span
                    title={densityTypeString}
                    class="density-icon mdi mdi-format-line-spacing"
                ></span>
                <span
                    class="density-label"
                    onClick={(e) => this.toggleDensityVisibility(e, top)}
                >
                    {densityType}
                </span>
                <div
                    role="button"
                    onClick={(e) => this.toggleDensityVisibility(e, top)}
                    tabindex="0"
                >
                    <svg
                        version="1.1"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path d="M7,10L12,15L17,10H7Z" />
                    </svg>
                </div>
                <div
                    class={{
                        'density-panel-overlay': true,
                        open: top
                            ? this.topDensityPanelVisible
                            : this.botDensityPanelVisible,
                    }}
                >
                    <div
                        class={{
                            wrapper: true,
                            active: this.density === 'small',
                        }}
                        onClick={() => (this.density = 'small')}
                        role="button"
                        tabindex="0"
                        aria-pressed={
                            this.density === 'small' ? 'true' : 'false'
                        }
                    >
                        <span
                            title="Compatta"
                            class="density-icon-panel mdi mdi-format-align-justify"
                        ></span>
                    </div>

                    <div
                        class={{
                            wrapper: true,
                            active: this.density === 'medium',
                        }}
                        onClick={() => (this.density = 'medium')}
                        role="button"
                        tabindex="0"
                        aria-pressed={
                            this.density === 'medium' ? 'true' : 'false'
                        }
                    >
                        <span
                            title="Normale"
                            class="density-icon-panel mdi mdi-reorder-horizontal"
                        ></span>
                    </div>
                    <div
                        class={{
                            wrapper: true,
                            active: this.density === 'big',
                        }}
                        onClick={() => (this.density = 'big')}
                        role="button"
                        tabindex="0"
                        aria-pressed={this.density === 'big' ? 'true' : 'false'}
                    >
                        <span
                            title="Ampia"
                            class="density-icon-panel mdi mdi-view-sequential"
                        ></span>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        // resetting rows
        this.renderedRows = [];

        let rows = null;
        if (this.paginatedRows.length === 0) {
            rows = (
                <tr>
                    <td colSpan={this.calculateColspan()}>Empty data</td>
                </tr>
            );
        } else {
            rows = [];
            this.paginatedRows
                // We must pass the previous element of the array to check if we must hide or display the value of the cell
                // When the column has specified the parameter hideValuesRepetitions
                .map((row, rowIndex, currentArray) =>
                    this.renderRow(
                        row,
                        0,
                        rowIndex > 0 ? currentArray[rowIndex - 1] : null
                    )
                )
                .forEach((jsxRow) => {
                    if (Array.isArray(jsxRow)) {
                        jsxRow.forEach((jr) => rows.push(jr));
                    } else {
                        rows.push(jsxRow);
                    }
                });
        }

        // header
        // for multi selection purposes, this should be called before this.renderedRows has been evaluated
        const header = this.renderHeader();

        // footer
        const footer = this.renderFooter();

        let globalFilter = null;
        if (this.globalFilter) {
            globalFilter = (
                <div id="globalFilter">
                    <kup-text-input
                        label="Global filter"
                        onKetchupTextInputUpdated={(event) =>
                            this.onGlobalFilterChange(event)
                        }
                    />
                </div>
            );
        }

        let paginatorTop = null;
        if (
            PaginatorPos.TOP === this.paginatorPos ||
            PaginatorPos.BOTH === this.paginatorPos
        ) {
            paginatorTop = this.renderPaginator(true);
        }

        let paginatorBottom = null;
        if (
            PaginatorPos.BOTTOM === this.paginatorPos ||
            PaginatorPos.BOTH === this.paginatorPos
        ) {
            paginatorBottom = this.renderPaginator(false);
        }

        let groupChips = null;
        if (this.isGrouping()) {
            const chips = this.groups.map((group) => {
                const column = getColumnByName(this.getColumns(), group.column);

                if (column) {
                    return (
                        <kup-chip
                            closable
                            onClose={() => this.removeGroup(group)}
                        >
                            {column.title}
                        </kup-chip>
                    );
                } else {
                    return null;
                }
            });

            groupChips = <div id="group-chips">{chips}</div>;
        }

        const tableClass = {
            // Class for specifying if the table should have width: auto.
            // Mandatory to check with custom column size.
            'auto-width': !!(this.columnsWidth && this.columnsWidth.length && this.tableHasAutoWidth()),
            'column-separation':
                ShowGrid.COMPLETE === this.showGrid ||
                ShowGrid.COL === this.showGrid,
            // When there are columns with a specified width, we must add table-layout: fixed to force the table to respect them
            'row-separation':
                ShowGrid.COMPLETE === this.showGrid ||
                ShowGrid.ROW === this.showGrid,

            'persistent-header': this.headerIsPersistent,
        };

        tableClass[`density-${this.density}`] = true;
        tableClass[`fontsize-${this.fontsize}`] = true;

        return (
            <div id="data-table-wrapper">
                <div class="above-wrapper">
                    {paginatorTop}
                    {globalFilter}
                </div>
                <div class="below-wrapper">
                    {groupChips}
                    <table class={tableClass}>
                        <thead
                            hidden={!this.showHeader}
                            ref={(el) =>
                                (this.theadRef = el as HTMLTableSectionElement)
                            }
                        >
                            <tr>{header}</tr>
                        </thead>
                        <tbody>{rows}</tbody>
                        {footer}
                    </table>
                </div>
                {paginatorBottom}
            </div>
        );
    }
}
