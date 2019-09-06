/**
 * NOTES:
 * In this test suites, TreeNodes are not expanded.
 */
import {E2EElement, newE2EPage} from '@stencil/core/testing';

import {Column, GenericMap,} from '../../../src/components/kup-data-table/kup-data-table-declarations';
import { TreeNode, treeExpandedPropName} from '../../../src/components/kup-tree/kup-tree-declarations';
import {flattenTree, TreeConfigData, TreeFactory} from '../../../src/components/kup-tree/kup-tree-faker';
import { KupTreeSelectors } from './tree__selectors';
import { testTreeNodeValue } from './tree__test__helpers';
import { styleHasBorderRadius } from "../../../src/components/kup-data-table/kup-data-table-helper";

let data: TreeNode[] | undefined;
let columns: Column[] | undefined;
let page, treeElement, treeHeader, visibleColumns, expandedListener;

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

  describe('when is displayed as table', () => {
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


  describe.each([['tree'],['table']])('in %s mode', (displayMode) => {
    beforeEach(async () => {
      expandedListener = await treeElement.spyOnEvent('kupTreeNodeExpand');

      switch (displayMode) {
        case 'tree':

          break;
        case 'table':
          visibleColumns = columns.filter(col => col.visible);
          treeElement.setAttribute('show-columns', 'true');
          await page.waitForChanges();
          break;
      }
    }, 30000);

    afterEach(() => {
      expandedListener = null;
      visibleColumns = undefined;
    });


    it('can expand automatically', async () => {
      // Table nodes are not expanded automatically by default
      // First we check that the treeElement is not expanded
      let flatTree = flattenTree(await treeElement.getProperty('data'));
      let treeNodeCells: Array<E2EElement> = await page.findAll(KupTreeSelectors.OnlyTreeNodeCells);

      expect(flatTree).toHaveLength(data.length);

      for (let i = 0; i < flatTree.length; i++) {
        await testTreeNodeValue(treeNodeCells[i], flatTree[i].value);
      }

      // Now sets automatic expansion and set again the data to trigger the expansion
      treeElement.setAttribute('expanded', 'true');
      treeElement.setProperty('data', [...data]);

      await page.waitForChanges();

      flatTree = flattenTree(await treeElement.getProperty('data'));
      treeNodeCells = await page.findAll(KupTreeSelectors.OnlyTreeNodeCells);

      // The elements are expanded automatically, they should not fire any event
      expect(expandedListener).toHaveLength(0);

      expect(flatTree).not.toHaveLength(data.length);
      expect(flatTree).toHaveLength(treeNodeCells.length);

      for (let i = 0; i < flatTree.length; i++) {
        await testTreeNodeValue(treeNodeCells[i], flatTree[i].value);
      }
    }, 60000);


    it('fires kupOptionClicked when an option is clicked', async () => {
      const checkOptionPayload = ({ detail }, cellDataValue: string, treeNode: TreeNode, columnName: string = "TreeNodeCell") => {
        expect(detail.treeNode.id).toEqual(treeNode.id);
        expect(detail.cell.value).toEqual(cellDataValue);
        expect(detail.column.name).toEqual(columnName);
      };

      // Sets listener for the event
      const optionClickedListener = await treeElement.spyOnEvent('kupOptionClicked');

      treeElement.setAttribute('expanded', 'true');
      treeElement.setAttribute('show-object-navigation', 'true');
      treeElement.setProperty('data', [...data]);
      await page.waitForChanges();

      expect(optionClickedListener).toHaveLength(0);

      let flatTree = flattenTree(await treeElement.getProperty('data'));
      let treeNodeCells = await page.findAll(KupTreeSelectors.TableRows);
      let eventsFired: number = 0;

      for (let i = 0; i < flatTree.length; i++) {
        const currentNodeData = flatTree[i];
        const nodePosition = await treeNodeCells[i].getBoundingClientRect();
        await page.mouse.move(nodePosition.top + 4, nodePosition.left + 4);

        if (currentNodeData.options) {
          const optionElement = await treeNodeCells[i].find(KupTreeSelectors.TreeNodeCell + ' ' + KupTreeSelectors.OptionElement);

          if (!currentNodeData.disabled) {
            await optionElement.click();

            // Checks if the event was fired
            eventsFired++;
            expect(optionClickedListener).toHaveLength(eventsFired);
            checkOptionPayload(
              optionClickedListener.lastEvent,
              currentNodeData.value,
              currentNodeData
            );
          } else {
            // When node is disabled it should not render option icon
            expect(optionElement).toBe(null)
          }
        }

        if (displayMode === 'table' && !currentNodeData.disabled) {
          const visibleColumnsWithOptions = [];
          visibleColumns.forEach((col, index) => {
            if (currentNodeData.cells[col.name].options) {
              visibleColumnsWithOptions.push(index);
            }
          });

          for (let k = 0; k < visibleColumnsWithOptions.length; k++) {
            const optionElement = await treeNodeCells[i].find('td:nth-of-type(' + (visibleColumnsWithOptions[k] + 2) + ') ' + KupTreeSelectors.OptionElement);
            await optionElement.click();

            // Checks if the event was fired
            eventsFired++;
            expect(optionClickedListener).toHaveLength(eventsFired);
            checkOptionPayload(
              optionClickedListener.lastEvent,
              currentNodeData.cells[visibleColumns[visibleColumnsWithOptions[k]].name].value,
              currentNodeData,
              visibleColumns[visibleColumnsWithOptions[k]].name
            );
          }
        }
      }

      // This test is truly monstrous. It needs a high time to be performed
    }, 400000);


    it('can expand TreeNodes', async () => {
      expect(true).toBeTruthy();

      let expandedNodesCount: number = 0;

      // Expand first layer of elements
      let treeNodeCells: Array<E2EElement> = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].expandable && !data[i].disabled) {
          expandedNodesCount++;
          treeNodeCells = await page.findAll(KupTreeSelectors.OnlyTreeNodeCells);

          // IMPORTANT: Once data is set, there is no further link between this test file 'data' prop
          // and the actual 'data' prop located on the treeElement.
          // To avoid future errors, keep this in mind when you have to perform checks and operations on updated data.
          // You have to fetch the updated data asynchronously like this
          // await element.getProperty('propName')
          const flatTree = flattenTree(await treeElement.getProperty('data'));

          // Checks that currently rendered TreeNodes have the same length as its FlatTree
          expect(treeNodeCells).toHaveLength(flatTree.length);

          for (let j = 0; j < flatTree.length; j++) {
            if (data[i].id === flatTree[j].id) {
              // Should have Found the element -> controls its value
              const cellContent = await treeNodeCells[j].find('.cell-content');
              expect(cellContent).toEqualText(data[i].value);

              // Searches expander and control it can expand -> triggers expansion
              const expanderNode = await treeNodeCells[j].find('.kup-tree__node__expander');
              expect(expanderNode).toHaveClass('mdi-menu-down');
              await expanderNode.click();

              // Checks if event was correctly registered
              expect(expandedListener).toHaveLength(expandedNodesCount);

              break;
            }
          }
        }
      }

      // Checks that each event has the correct payload
      for (let k = 0; k < expandedListener.events.length; k++) {
        const { detail } = expandedListener.events[k];
        expect(detail).toHaveProperty('treeNodePath');
        expect(Array.isArray(detail.treeNodePath)).toBeTruthy();
        expect(detail).toHaveProperty('treeNode');
        if (detail.usesDynamicExpansion) {
          expect(detail.usesDynamicExpansion).toBeFalsy();
        }
      }

      // This is a long test, waits for almost a minute before dropping it
    }, 60000);


  });

  // console.log("tnc", tnc.childNodes.length);
  // console.log(KupTreeSelectors, treeNodeCells);
  // console.log("contenuto", Object.keys(treeRows[0]));
  // console.log("figli", treeRows[0].childNodes);
  // console.log(data[i].value, flatTree[j].value, treeNodeCells.length);
  // await page.screenshot({path: `screenshot_${displayMode}_${j}.png`});
  // console.log("afterlunghezza", flattenTree(data).length, data.map((node) => node[treeExpandedPropName]));
});
