/**
 * NOTES:
 * In this test suites, TreeNodes are not expanded.
 */
import {E2EElement, newE2EPage} from '@stencil/core/testing';

import {Column, GenericMap,} from '../../../src/components/kup-data-table/kup-data-table-declarations';
import { TreeNode,  } from '../../../src/components/kup-tree/kup-tree-declarations';
import { TreeConfigData, TreeFactory } from '../../../src/components/kup-tree/kup-tree-faker';
import { KupTreeSelectors } from './tree__selectors';
import { styleHasBorderRadius } from "../../../src/components/kup-data-table/kup-data-table-helper";

let data: TreeNode[] | undefined;
let columns: Column[] | undefined;
let page, treeElement, treeHeader, visibleColumns;

/**
 * Given a E2EElement node and a style object, checks if all properties of the given style are present inside the
 * getComputedStyle of the htmlNode element.
 *
 * There is [an issue]{@link TreeDataPool.cellStyles} with testing colors.
 *
 * Uses the match method to check if string is contained within the second argument.
 * This is done because some computed style values (example: text-decoration) will return multiple values.
 *
 * @async
 * @param htmlNode - Reference to the node to test.
 * @param style - the style object the computeStyle of the htmlNode will be tested against.
 * @see https://www.w3schools.com/cssref/pr_text_text-decoration.asp
 */
async function testElementStyle(htmlNode: E2EElement, style: GenericMap) {
  const styleProps = Object.keys(style);
  let cellComputedStyle = await htmlNode.getComputedStyle();

  // Checks that each css prop is set
  styleProps.forEach(prop => {
    expect(
      // Gets the CSS kebab-case properties and converts them into JS camelCase
      cellComputedStyle[prop.replace(/-([a-z])/g, (a,b) => b.toUpperCase())]
    ).toMatch(style[prop]);
  });
}

describe('kup-tree with data', () => {
  //---- Creates a new batch of data and then cleans it ----
  beforeEach(async () => {
    const treeData: TreeConfigData = TreeFactory(4,4);
    data = treeData.data;
    columns = treeData.columns;

    page = await newE2EPage();
    await page.setContent('<kup-tree></kup-tree>');
    treeElement = await page.find('kup-tree');
    treeElement.setProperty('data', data);
    await page.waitForChanges();
    treeElement.setProperty('columns', columns);
    await page.waitForChanges();
    treeHeader = await page.find(KupTreeSelectors.TreeHeader);
  }, 30000);

  afterEach(() => {
    data = undefined;
    columns = undefined;
    treeElement = undefined;
    page = undefined;
  });

  it('renders in tree mode', async () => {
    const treeRows = await page.findAll(KupTreeSelectors.TableRows);

    // Must render only base nodes
    expect(treeRows).toHaveLength(data.length);

    // Since it's a basic tree, must render only the TreeNodeCell
    treeRows.forEach(row => expect(row.childNodes).toHaveLength(1));

    const headerStyle = await treeHeader.getComputedStyle();
    // The table header must be hidden
    expect(headerStyle.display).toEqual('none');
  });

  it('renders TreeNodeCell correctly', async () => {
    const treeNodeCells = await page.findAll(KupTreeSelectors.OnlyTreeNodeCells);

    // Each TreeNode must have its TreeNodeCell
    expect(treeNodeCells).toHaveLength(data.length);

    for (let index = 0; index < treeNodeCells.length; index++) {
      // Reference to the current node data from which the tnc was rendered
      const currentNodeData = data[index];
      const tnc = treeNodeCells[index];

      // Since icon is not hidden and showObjectNavigation is not set,
      // each TreeNodeCell must render 3 elements:
      // open/close icon, TreeNode icon and the cell content
      expect(tnc.childNodes).toHaveLength(3);

      // First child is menu down icon
      const nodeExpanderClasses = ['mdi', 'mdi-menu-down'];
      if (currentNodeData.expandable) {
        // When TreeNode is expandable, it has the menu-down icon
        expect(tnc.childNodes[0]).toHaveClasses(nodeExpanderClasses);
      } else {
        expect(tnc.childNodes[0]).not.toHaveClasses(nodeExpanderClasses);
      }

      // Second item must be the NodeTree icon
      expect(tnc.childNodes[1]).toHaveClass('kup-tree__icon');

      // Third item is the NodeTree content
      expect(tnc.childNodes[2]).toEqualText(currentNodeData.value);

      // If a style is specified on the TreeNodeCell, it must be applied
      if (currentNodeData.style) {
        await testElementStyle(tnc, currentNodeData.style);
      } else {
        expect(tnc).not.toHaveAttribute('style');
      }
    }
  });

  describe('is displayed as table', () => {
    beforeEach(async () => {
      visibleColumns = columns.filter(col => col.visible);
      treeElement.setAttribute('show-columns', 'true');
      await page.waitForChanges();
    }, 30000);

    afterEach(() => {
      visibleColumns = undefined;
    });

    it('shows all other visible columns', async () => {
      const treeNodes = await page.findAll(KupTreeSelectors.TableRows);

      // For all visible columns each TreeNode must have an equal amount of cells
      treeNodes.forEach(node => expect(node.childNodes).toHaveLength(1 + visibleColumns.length));

      // The header still must NOT be visible
      const headerStyle = await treeHeader.getComputedStyle();
      expect(headerStyle.display).toEqual('none');
    });

    it('shows header when attribute show-header is set', async () => {
      treeElement.setAttribute('show-header', 'true');
      await page.waitForChanges();

      // The header MUST be visible
      const headerStyle = await treeHeader.getComputedStyle();
      expect(headerStyle.display).toEqual('table-header-group');

      const treeHeaderCells = treeHeader.childNodes[0].childNodes;
      expect(treeHeaderCells).toHaveLength(1 + visibleColumns.length);

      // th of the TreeNodeCell must be empty
      expect(treeHeaderCells[0]).toEqualText("");
    });

    it('applies style to cells with style', async () => {
      const treeNodes = await page.findAll(KupTreeSelectors.TableRows);
      for (let i = 0; i < treeNodes.length; i++) {
        const rowCells = await treeNodes[i].findAll('td');

        for (let j = 0; j < visibleColumns.length; j++) {
          const col = visibleColumns[j];
          const currentCell = data[i].cells[col.name];
          const theStyle = currentCell.style;

          // Controls if we have a style to test against
          if (theStyle) {
            // By default, style which does NOT have border radius is applied only to td element
            let elementStyleCompare = rowCells[j + 1];

            // Style DOES have border radius -> is applied only to .cell-content element
            if (styleHasBorderRadius(currentCell)) {
              elementStyleCompare = await rowCells[j + 1].find('.cell-content');
            }

            await testElementStyle(elementStyleCompare, theStyle);
          }
        }
      }
    });

  });

  // console.log("tnc", tnc.childNodes.length);
  // console.log(KupTreeSelectors, treeNodeCells);
  // console.log("contenuto", Object.keys(treeRows[0]));
  // console.log("figli", treeRows[0].childNodes);
});
