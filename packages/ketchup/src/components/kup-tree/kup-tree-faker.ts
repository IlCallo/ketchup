//---- Types ----
import {CellsHolder, Column} from "./../kup-data-table/kup-data-table-declarations"
import {TreeNode, TreeNodePath} from "./kup-tree-declarations"

export interface FactoryTreeNodeOptions {
  minimumChildCount: number;
  propagate?: boolean;
}

export interface FactoryTreeOptions {
  forceColumnVisibility: boolean;
}

export interface DynamicExpansionFakerOptions {
  useDelay?: number;
}

export interface TreeConfigData {
  columns: Column[],
  data: TreeNode,
}

//---- Constants ----

/**
 * The data pool usable to populate a fake TreeNode
 * See {@link TreeDataPool.cellStyles}
 * @namespace
 */
const TreeDataPool: {
    cellStyles: Array<{[index: string]: string}>,
    columnsName: string[],
    nameValues: string[],
    programValues: string[],
  } = {
  /**
   * IMPORTANT: colors here must always be specified as rgb or rgba()
   * This is due to a browser method getComputedStyle which always computes the colors as rgb/rgba values
   * So when using a HEX color (for example) to test these objects, the test will fail due to a different color format received.
   *
   * See [this issue]{@link https://www.npmjs.com/package/color} event if it's related to Cypress and not Jest.
   * The concepts are identical.
   *
   * @memberOf! TreeDataPool
   * @see https://www.npmjs.com/package/color
   */
  cellStyles: [
    {
      'background-color': 'rgb(84, 84, 84)',
      color: 'rgba(255, 0, 255, 0.87)'
    },
    {
      'background-color': 'rgba(0, 255, 0, 0.54)',
      color: 'rgb(255, 255, 255)',
      'font-size': '20px'
    },
    {
      'background-color': 'rgb(46, 125, 50)',
      color: 'rgba(130, 20, 200, 0.54)',
      'text-decoration': 'underline',
    },
    {
      backgroundColor: 'rgb(0, 16, 100)',
      borderRadius: '4px',
      color: 'rgba(0, 200, 225, 0.54)',
      textDecoration: 'line-through',
    },
  ],
  columnsName: ['Mat', 'Program', 'Attack', 'Defense'],
  nameValues: ['DELGIO', 'CASFRA', 'PARFRA', 'FIOGIA', 'ZAMCHI'],
  programValues: ['Java', 'Javascript', 'Delphi', 'Kotlin', 'Go']
};

/**
 * If the Math.random() value is equal lower than the given a threshold, return true. False otherwise.
 * @param probability - The probability that the returned boolean will be truthy.
 */
function getBooleanOnProbability(probability: number = .5): boolean {
  return Math.random() < probability;
}

export default function getRandomInteger(maximum: number = 10): number {
  return Math.round(Math.random() * maximum);
}

function ColumnFactory(index: number, forceVisibility: boolean = false) {
  let colName = TreeDataPool.columnsName[index]
    ? TreeDataPool.columnsName[index]
    : 'Col' + index;

  return {
    name: colName,
    title: colName + ' Title',
    visible: forceVisibility || getBooleanOnProbability(.7),
  }
}

function TreeNodeFactory(
  columns: any[],
  depth: {
    current: number,
    max: number
  } = {
    current: 0,
    max: 5
  },
  index: number,
  options: {
    minimumChildCount: number,
    maximumChildCount?: number,
    propagate?: boolean,
  } = {
    minimumChildCount: 0,
  }): TreeNode {
  let childrenCount = Math.max(getRandomInteger(options.maximumChildCount || 5), options.minimumChildCount);
  const children: any[] = [];

  // If it can have children, and the randomly extracted children are more than 1, adds children to this node
  if (depth.current < depth.max && childrenCount) {
    for (let i = 0; i < childrenCount; i++) children.push(
      TreeNodeFactory(
        columns,
        {
          current: depth.current + 1,
          max: depth.max,
        },
        i,
        options.propagate ? options : undefined
      )
    );
  } else {
    // IT can have no children, so we set them to 0
    // Fixes an error of expand icon rendering even if the node is not expandable
    childrenCount = 0;
  }

  // Defines a generated value to be used
  const depthAndIndex: string = depth.current.toString() + index.toString();

  // Adds cells to the Node
  let cells: CellsHolder = {};
  if (columns && columns.length) {
    for (let j = 0; j < columns.length; j++) {
      const colName = columns[j].name;
      const cellValue = depthAndIndex + colName;
      cells[colName] = {
        obj: {
          t: 'NR',
          p: '',
          k: cellValue,
        },
        value: cellValue,
        style: getBooleanOnProbability(.2) ? TreeDataPool.cellStyles[getRandomInteger(TreeDataPool.cellStyles.length - 1)] : undefined,
        options: getBooleanOnProbability(.5),
        //config: any,
      };
    }
  }

  return {
    // actions?: Array<RowAction>;
    cells,

    children,

    disabled: getBooleanOnProbability(.3),

    expandable: !!childrenCount,

    iconClass: 'account',

    id: depthAndIndex + childrenCount.toString(),

    value: TreeDataPool.nameValues[getRandomInteger(TreeDataPool.nameValues.length - 1)] + depthAndIndex, // TODO check if this is here
  };
}

/**
 * Function returning the columns and the data to create and initialize a kup-tree component.
 * @param treeDepth - How many subtree a tree can have.
 * @param columnCount - How many columns the columns field must generate.
 * @param options - Generic options
 * @param treeOptions - Options bag to pass to the treeNodeFactory
 * @returns {{columns: array, data: object}}*
 */
export function TreeFactory(
  treeDepth: number = 5,
  columnCount: number = 4,
  options: FactoryTreeOptions = {
    forceColumnVisibility: false,
  },
  treeOptions: FactoryTreeNodeOptions = {
    minimumChildCount: 5,
  }
): TreeConfigData {
  let columns = [];

  for (let i = 0; i < columnCount; i++) {
    columns.push(ColumnFactory(i, options.forceColumnVisibility));
  }

  return {
    columns,
    data: TreeNodeFactory(
      columns,
      {
        current: -1,
        max: treeDepth
      },
      -1,
      treeOptions,
    ),
  }
}

/**
 * Function mocking a DynamicallyExpandable tree.
 * @param treeDepth - How many subtree a tree can have.
 * @param columnCount - How many columns the columns field must generate.
 * @param options - Generic options bag
 * @param options.tree - Options bag to pass to the TreeFactory
 * @param options.treeNode - Options bag to pass to the TreeNodeFactory
 * @param [options.dynamicExpansion] - Options bag to pass to the DynamicExpansionFaker
 * @returns {{columns: array, data: object}}*
 */
export function DynamicExpansionFaker(
  treeDepth: number = 5,
  columnCount: number = 4,
  options: {
    tree: FactoryTreeOptions;
    treeNode: FactoryTreeNodeOptions;
    dynamicExpansion?: DynamicExpansionFakerOptions;
  } = {
    tree: {
      forceColumnVisibility: false
    },
    treeNode: {
      minimumChildCount: 5,
    }
  },
) {

  // Function to copy a tree node but not its children.
  function copyTreeNodeWithoutChildren(node: TreeNode): TreeNode {
    const {children, ...otherProps} = node;
    return {
      ...otherProps,
      children: []
    }
  }

  function getTreeNodeChildren(treeRoot: TreeNode, nodePath: TreeNodePath = []) {
    let children = treeRoot.children;
    if (nodePath.length) {
      for (let i = 0; i < nodePath.length && children && children.length; i++) {
        children = children[nodePath[i]].children;
      }
    }
    return children.map(child => copyTreeNodeWithoutChildren(child));
  }

  // Generates the model
  const treeDataSource = TreeFactory(
    treeDepth,
    columnCount,
    options.tree,
    options.treeNode,
  );

  const data = copyTreeNodeWithoutChildren(treeDataSource.data);

  data.children = getTreeNodeChildren(treeDataSource.data);

  return {
    data,
    columns: treeDataSource.columns,
    getTreeNodeChildren(nodePath: TreeNodePath = []) {
      const children = getTreeNodeChildren(treeDataSource.data, nodePath);
      const waitTime = options.dynamicExpansion && options.dynamicExpansion.useDelay? options.dynamicExpansion.useDelay : 0;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (children) resolve(children);
          else reject("404: The required children of the given treeNodePath could not be found.");
        }, waitTime);
      });
    },
    treeDataSource,
  };
}
