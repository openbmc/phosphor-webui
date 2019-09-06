window.angular && (function(angular) {
  'use strict';

  /**
   *
   * bmcTable Component
   *
   * To use:
   *
   * The 'data' attribute should be an array of all row objects in the table.
   * It will render each item as a <tr> in the table.
   * Each row object in the data array should also have a 'uiData'
   * property that should be an array of the properties that will render
   * as each table cell <td>.
   * Each row object in the data array can optionally have an
   * 'actions' property that should be an array of actions to provide the
   * <bmc-table-actions> component.
   * Each row object can optionally have an 'expandContent' property
   * that should be a string value and can contain valid HTML. To render
   * the expanded content, set 'expandable' attribute to true.
   *
   * data = [
   *  { uiData: ['root', 'Admin', 'enabled' ] },
   *  { uiData: ['user1', 'User', 'disabled' ] }
   * ]
   *
   * The 'header' attribute should be an array of all header objects in the
   * table. Each object in the header array should have a 'label' property
   * that will render as a <th> in the table.
   * If the table is sortable, can optionally add 'sortable' property to header
   * row object. If a particular column is not sortable, set to false.
   *
   * header = [
   *  { label: 'Username' },
   *  { label: 'Privilege' }
   *  { label: 'Account Status', sortable: false }
   * ]
   *
   * The 'sortable' attribute should be a boolean value. Defaults to false.
   * The 'default-sort' attribute should be the index value of the header
   * obejct that should be sorted on inital load.
   *
   * The 'row-actions-enabled' attribute, should be a boolean value
   * Can be set to true to render table row actions. Defaults to false.
   * Row actions are defined in data.actions.
   *
   * The 'expandable' attribute should be a boolean value. If true each
   * row object in data array should contain a 'expandContent' property
   *
   * The 'size' attribute which can be set to 'small' which will
   * render a smaller font size in the table.
   *
   */

  const TableController = function() {
    this.sortAscending = true;
    this.activeSort;
    this.expandedRows = new Set();

    /**
     * Sorts table data
     */
    const sortData = () => {
      this.data.sort((a, b) => {
        const aProp = a.uiData[this.activeSort];
        const bProp = b.uiData[this.activeSort];
        if (aProp === bProp) {
          return 0;
        } else {
          if (this.sortAscending) {
            return aProp < bProp ? -1 : 1;
          }
          return aProp > bProp ? -1 : 1;
        }
      })
    };

    /**
     * Prep table
     * Make adjustments to account for optional configurations
     */
    const prepTable = () => {
      if (this.sortable) {
        // If sort is enabled, check for undefined 'sortable'
        // property for each item in header array
        this.header = this.header.map((column) => {
          column.sortable =
              column.sortable === undefined ? true : column.sortable;
          return column;
        })
      }
      if (this.rowActionsEnabled) {
        // If table actions are enabled push an empty
        // string to the header array to account for additional
        // table actions cell
        this.header.push({label: '', sortable: false});
      }
      if(this.expandable) {
        // If table is expandable, push an empty string to the
        // header array to account for additional expansion cell
        this.header.unshift({label: '', sortable: false});
      }
    }

    /**
     * Callback when table row action clicked
     * Emits user desired action and associated row data to
     * parent controller
     * @param {string} action : action type
     * @param {any} row : user object
     */
    this.onEmitTableAction = (action, row) => {
      if (action !== undefined && row !== undefined) {
        const value = {action, row};
        this.emitAction({value});
      }
    };

    /**
     * Callback when sortable table header clicked
     * @param {number} index : index of header item
     */
    this.onClickSort = (index) => {
      if (index === this.activeSort) {
        // If clicked header is already sorted, reverse
        // the sort direction
        this.sortAscending = !this.sortAscending;
        this.data.reverse();
      } else {
        this.sortAscending = true;
        this.activeSort = index;
        sortData();
      }
    };

    /**
     * Callback when expand trigger clicked
     * @param {number} row : index of expanded row
     */
    this.onClickExpand = (row) => {
      if(this.expandedRows.has(row)){
        this.expandedRows.delete(row)
      } else {
        this.expandedRows.add(row);
      }
    }

    /**
     * onInit Component lifecycle hook
     * Checking for undefined values
     */
    this.$onInit = () => {
      this.header = this.header === undefined ? [] : this.header;
      this.data = this.data == undefined ? [] : this.data;
      this.sortable = this.sortable === undefined ? false : this.sortable;
      this.rowActionsEnabled =
          this.rowActionsEnabled === undefined ? false : this.rowActionsEnabled;
      this.size = this.size === undefined ? '' : this.size;
      this.expandable = this.expandable === undefined ? false : this.expandable;

      // Check for undefined 'uiData' property for each item in data array
      this.data = this.data.map((row) => {
        if (row.uiData === undefined) {
          row.uiData = [];
        }
        return row;
      })
      prepTable();
    };

    /**
     * onChanges Component lifecycle hook
     * Check for changes in the data array and apply
     * default or active sort if one is defined
     */
    this.$onChanges = (onChangesObj) => {
      const dataChange = onChangesObj.data;
      if (dataChange) {
        if (this.activeSort !== undefined || this.defaultSort !== undefined) {
          this.activeSort = this.defaultSort !== undefined ? this.defaultSort :
                                                             this.activeSort;
          sortData();
        }
      }
    }
  };

  /**
   * Register bmcTable component
   */
  angular.module('app.common.components').component('bmcTable', {
    template: require('./table.html'),
    controller: TableController,
    bindings: {
      data: '<',               // Array
      header: '<',             // Array
      rowActionsEnabled: '<',  // boolean
      size: '<',               // string
      sortable: '<',           // boolean
      defaultSort: '<',        // number (index of sort),
      expandable: '<',         // boolean
      emitAction: '&'
    }
  })
})(window.angular);
