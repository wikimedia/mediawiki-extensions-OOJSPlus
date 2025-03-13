( function ( mw, $ ) {

	OOJSPlus.ui.dialog.FormDialog = function ( config ) {
		OOJSPlus.ui.dialog.FormDialog.parent.call( this, config );

		this.titleLabel = config.title || '';
		// Title for the form inside the dialog
		this.formTitle = config.formTitle || '';
	};

	OO.inheritClass( OOJSPlus.ui.dialog.FormDialog, OO.ui.ProcessDialog );

	OOJSPlus.ui.dialog.FormDialog.static.name = 'oojs-ui-form-dialog';

	OOJSPlus.ui.dialog.FormDialog.prototype.getSetupProcess = function ( data ) {
		data = data || {};
		data = Object.assign( data, {
			title: this.getTitle()
		} );
		return OOJSPlus.ui.dialog.FormDialog.parent.prototype.getSetupProcess.call( this, data );
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.initialize = function () {
		OOJSPlus.ui.dialog.FormDialog.parent.prototype.initialize.call( this );

		this.content = new OO.ui.PanelLayout( { padded: true, expanded: false } );

		this.fieldset = new OO.ui.FieldsetLayout( {
			label: this.formTitle,
			items: this.getFormItems()
		} );

		this.content.$element.append( this.fieldset.$element );
		this.$body.append( this.content.$element );

		const actions = this._compileActions( this.getActions() );
		this.actions.add( this.getActionWidgets( actions ) );
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.getTitle = function () {
		return this.titleLabel;
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.getFormItems = function () {
		return [];
	};

	OOJSPlus.ui.dialog.FormDialog.prototype._compileActions = function ( actionKeys ) {
		const actions = [],
			definitions = this.getActionDefinitions();

		for ( let i = 0; i < actionKeys.length; i++ ) {
			if ( definitions.hasOwnProperty( actionKeys[ i ] ) ) {
				const definition = definitions[ actionKeys[ i ] ];
				if ( !definition.hasOwnProperty( 'id' ) ) {
					definition.id = this.getElementId() + '-action-' + actionKeys[ i ];
				}
				actions.push( definition );
			}
		}

		return actions;
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.getActions = function () {
		return [ 'cancel', 'done' ];
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.showErrors = function ( errors ) {
		OOJSPlus.ui.dialog.FormDialog.parent.prototype.showErrors.call( this, errors );
		this.updateSize();
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.getActionDefinitions = function () {
		return {
			done: { action: 'done', label: mw.message( 'oojsplus-dialog-action-done' ).plain(),
				flags: [ 'primary', 'progressive' ] },
			delete: { action: 'delete', label: mw.message( 'oojsplus-dialog-action-delete' ).plain(),
				flags: [ 'primary', 'destructive' ] },
			create: { action: 'create', label: mw.message( 'oojsplus-dialog-action-create' ).plain(),
				flags: [ 'primary', 'progressive' ] },
			add: { action: 'add', label: mw.message( 'oojsplus-dialog-action-add' ).plain(),
				flags: [ 'primary', 'progressive' ] },
			cancel: { action: 'cancel', label: mw.message( 'oojsplus-dialog-action-cancel' ).plain(),
				flags: 'safe' }
		};
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.setTitle = function ( title ) {
		this.title.setLabel( title );
		this.titleLabel = title;
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.show = function () {
		if ( !this.windowManager ) {
			this.windowManager = new OO.ui.WindowManager( {
				modal: true
			} );
			$( document.body ).append( this.windowManager.$element );
			this.windowManager.addWindows( [ this ] );
		}

		return this.windowManager.openWindow( this );
	};

	/**
	 * @param {string} action
	 * @return {OO.ui.Process|null} if not handling
	 */
	OOJSPlus.ui.dialog.FormDialog.prototype.onAction = function ( action ) { // eslint-disable-line no-unused-vars
		return null;
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.getActionProcess = function ( action ) {
		return OOJSPlus.ui.dialog.FormDialog.parent.prototype.getActionProcess.call( this, action ).next(
			() => {
				if ( action === 'cancel' ) {
					this.close( { action: action } );
				} else {
					const process = this.onAction( action );
					if ( process === null ) {
						return OOJSPlus.ui.dialog.FormDialog.prototype.getActionProcess.call( this, action );
					}
					return process;
				}
			}
		);
	};

	OOJSPlus.ui.dialog.FormDialog.prototype.getBodyHeight = function () {
		if ( !this.$errors.hasClass( 'oo-ui-element-hidden' ) ) {
			return this.$element.find( '.oo-ui-processDialog-errors' )[ 0 ].scrollHeight;
		}

		return this.$element.find( '.oo-ui-window-body' )[ 0 ].scrollHeight + 20;
	};

}( mediaWiki, jQuery ) );
