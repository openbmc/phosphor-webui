window.angular && (function(angular) {
  'use strict';

  /**
   *
   * bmcTable Component
   *
   * To use:
   * The <bmc-table> component expects a 'model' attribute
   * that will contain all the data needed to render the table.
   *
   * The component also accepts a 'row-actions-enabled' attribute,
   * to optionally render table row actions. Defaults to false.
   * Pass true to render actions. Row actions are defined in
   * model.data.actions.
   *
   *
   * The model object should contain 'header', and 'data'
   * properties.
   *
   * model: {
   *    header: <string>[],  // Array of header labels
   *    data: <any>[],       // Array of each row object
   * }
   *
   * The header property will render each label as a <th> in the table.
   *
   * The data property will render each item as a <tr> in the table.
   * Each row object in the model.data array should also have a 'uiData'
   * property that should be an array of the properties that will render
   * as each table cell <td>.
   * Each row object in the model.data array can optionally have an
   * 'actions' property that should be an array of actions to provide the
   * <bmc-table-actions> component.
   *
   * The 'rowActionsEnabled' property will render <bmc-table-actions> if set
   * to true.
   *
   */

  const TableController = function() {
    /**
     * Init model data
     * @param {any} model : table model object
     * @returns : table model object with defaults
     */
    const setModel = (model) => {
      model.header = model.header === undefined ? [] : model.header;
      model.data = model.data === undefined ? [] : model.data;
      model.data = model.data.map((row) => {
        if (row.uiData === undefined) {
          row.uiData = [];
        }
        return row;
      })
      return model;
    };

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
     * onInit Component lifecycle hooked
     */
    this.$onInit = () => {
      if (this.model === undefined) {
        console.log('<bmc-table> Component is missing "model" attribute.');
        return;
      }
      this.model = setModel(this.model);
      this.rowActionsEnabled = this.rowActionsEnabled === undefined ? false : true;
      if (this.rowActionsEnabled) {
        // If table actions are enabled push an empty
        // string to the header array to account for additional
        // table actions cell
        this.model.header.push('');
      }
    };
  };

  /**
   * Register bmcTable component
   */
  angular.module('app.common.components').component('bmcTable', {
    template: require('./table.html'),
    controller: TableController,
    bindings: {model: '<', rowActionsEnabled: '<', emitAction: '&'}
  })
})(window.angular);
