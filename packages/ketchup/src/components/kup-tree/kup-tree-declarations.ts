import {
  CellsHolder,
  RowAction,
} from "./../kup-data-table/kup-data-table-declarations";

/**
 * The name of the property used by the tree component to store whether a TreeNode is open or closed
 * @constant
 */
export const treeExpandedPropName = '_kupTreeIsExpanded';

export interface TreeNode {
  actions?: Array<RowAction>;

  cells: CellsHolder;

  children: Array<TreeNode>;

  disabled: boolean;

  expandable: boolean;

  iconClass?: string;

  id?: string;

  // TODO what is this?
  readOnly?: boolean;

  value: string; // TODO check if this is here

  [treeExpandedPropName]?: boolean;
}

export type TreeNodePath = number[];
