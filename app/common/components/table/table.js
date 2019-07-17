window.angular && (function(angular) {
  'use strict';

  /**
   * Controller for bmcTable Component
   */
  const TableController = function() {
    /**
     * Init model data
     * @param {any} model : table model object
     * @returns : table model object with default
     */
    const setModel = (model) => {
      model.header = model.header === undefined ? [] : model.header;
      model.data = model.data === undefined ? [] : model.data;
      model.data.uiData =
          model.data.uiData === undefined ? [] : model.data.uiData;
      model.actions = model.actions === undefined ? [] : model.actions;

      if (model.actions.length > 0) {
        // If table actions were provided, push an empty
        // string to the header array to account for additional
        // table actions cell
        model.header.push('');
      }
      return model;
    };

    /**
     * Callback when table row action clicked
     * Emits user desired action and associated row data to
     * parent controller
     * @param {string} action : action type
     * @param {any} row : user object
     */
    this.onClickAction = (action, row) => {
      if(action !== undefined && row !== undefined) {
        const value = {action, row};
        this.emitAction({value});
      }
    };

    /**
     * onInit Component lifecycle hooked
     */
    this.$onInit = () => {
      this.model = setModel(this.model);
    };
  };

  /**
   * Register bmcTable component
   */
  angular.module('app.common.components').component('bmcTable', {
    template: require('./table.html'),
    controller: TableController,
    bindings: {model: '<', emitAction: '&'}
  })
})(window.angular);
