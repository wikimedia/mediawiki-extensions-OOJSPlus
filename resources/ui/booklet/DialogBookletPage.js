( function ( mw, $ ) {
	OOJSPlus.ui.booklet.DialogBookletPage = function ( name, cfg ) {
		cfg = cfg || {};
		cfg.expanded = false;
		cfg.padded = true;
		OOJSPlus.ui.booklet.DialogBookletPage.parent.call( this, name, cfg );

		this.dialog = null;
		this.pageData = {};
		this.data = cfg.data || {};

		this.$element.addClass( 'oojsplus-dialog-booklet-page' );
	};

	OO.inheritClass( OOJSPlus.ui.booklet.DialogBookletPage, OO.ui.PageLayout );

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.getTitle = function () {
		return this.getName();
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.makePanel = function () {
		const items = this.getItems();
		for ( let i = 0; i < items.length; i++ ) {
			this.$element.append( items[ i ].$element );
		}
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.init = function () {
		this.makePanel();
		this.setData( this.data );
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.getItems = function () {
		return [];
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.setDialog = function ( dialog ) {
		this.dialog = dialog;
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.getDialog = function () {
		return this.dialog;
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.getSize = function () {
		return 'medium';
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.getAbilities = function () {
		const abilities = {}, actionKeys = this.getActionKeys();
		// By default, all actions are allowed
		for ( let i = 0; i < actionKeys.length; i++ ) {
			abilities[ actionKeys[ i ] ] = true;
		}
		return abilities;
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.getActionKeys = function () {
		return [];
	};

	/**
	 * Return an array of action definitions =>
	 * https://doc.wikimedia.org/oojs-ui/master/js/#!/api/OO.ui.ProcessDialog-static-property-actions
	 * See OOJSPlus.ui.dialog.FormDialog.prototype.getActionDefinitions for list of already defined actions
	 *
	 * @return {Array}
	 */
	OOJSPlus.ui.booklet.DialogBookletPage.prototype.getActionDefinitions = function () {
		return [];
	};

	/**
	 * Called when page is activated (booklet switched to it)
	 *
	 * @param {Object} data
	 */
	OOJSPlus.ui.booklet.DialogBookletPage.prototype.setData = function ( data ) {
		this.pageData = data;
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.getData = function () {
		return this.pageData;
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.updateDialogSize = function () {
		if ( this.dialog ) {
			this.dialog.updateSize();
		}
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.onAction = function ( action ) {
		// To switch to a different page, return a promise that resolves with
		// { action: 'switchPanel', page: 'page-to-switch-to', data: { custom: data, to: pass, to: page } }

		// To close dialog after action completed, return promise that resolves with
		//  { action: 'close', data: { to: pass, to: dialog, close: handler } }

		// To do nothing return a promise that resolves with nothing

		// To throw error return a promise that rejects with an error message

		if ( action === 'cancel' ) {
			return $.Deferred().resolve( { action: 'close' } ).promise();
		}
		return $.Deferred().resolve( {} ).promise();
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.checkValidity = function ( inputs ) {
		const dfd = $.Deferred();

		// Clone array
		const toCheck = inputs.slice( 0 );
		this.doCheckValidity( toCheck, dfd );

		return dfd.promise();
	};

	OOJSPlus.ui.booklet.DialogBookletPage.prototype.doCheckValidity = function ( inputs, dfd ) {
		if ( inputs.length === 0 ) {
			dfd.resolve();
			return;
		}
		const input = inputs.shift();

		input.getValidity().done( () => {
			input.setValidityFlag( true );
			this.doCheckValidity( inputs, dfd );
		} ).fail( () => {
			input.setValidityFlag( false );
			dfd.reject();
		} );
	};
}( mediaWiki, jQuery ) );
