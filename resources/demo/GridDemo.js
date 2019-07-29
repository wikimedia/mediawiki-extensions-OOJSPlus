( function( mw, $ ) {
	var $el = $( '#oojsplus-data-demos-grid' );

	var up_url = window.location.href;

	var data = [
		{ firstName: "John", lastName: "Doe", address: "Main street 22", userpage: "JD1", up_url: up_url, active: true },
		{ firstName: "Stephen", lastName: "Adams", address: "That street 1", userpage: "SA1", up_url: up_url, active: false },
		{ firstName: "Adriana", lastName: "C. Ocampo Uria", address: "8702 Victoria Street", userpage: "AC1", up_url: up_url, active: true },
		{ firstName: "Caroline", lastName: "Herschel", address: "849 Princeton Drive ", userpage: "CH", up_url: up_url, active: true },
		{ firstName: "Chien-Shiung", lastName: "Wu", address: "8017 Peg Shop St. ", userpage: "CSW", up_url: up_url, active: true },
		{ firstName: "Dorothy", lastName: "Hodgkin", address: "850 Princeton Drive", userpage: "DH", up_url: up_url, active: false },
		{ firstName: "Elizabeth", lastName: "Blackburn", address: "628 Heather St. ", userpage: "EB", up_url: up_url, active: true },
		{ firstName: "Geraldine", lastName: "Seydoux", address: "11 Acacia Ave.", userpage: "GS", up_url: up_url, active: true },
		{ firstName: "Gertrude", lastName: "B. Elion", address: "9542 Silver Spear Avenue ", userpage: "GBE", up_url: up_url, active: false }
	];

	var addData = [
		{ firstName: "Chien-Shiung added", lastName: "Wu", address: "8017 Peg Shop St. ", userpage: "CSW", up_url: up_url, active: true },
		{ firstName: "Dorothy added", lastName: "Hodgkin", address: "850 Princeton Drive", userpage: "DH", up_url: up_url, active: false },
		{ firstName: "Elizabeth added", lastName: "Blackburn", address: "628 Heather St. ", userpage: "EB", up_url: up_url, active: true },
		{ firstName: "Geraldine added", lastName: "Seydoux", address: "11 Acacia Ave.", userpage: "GS", up_url: up_url, active: true },
		{ firstName: "Gertrude added", lastName: "B. Elion", address: "9542 Silver Spear Avenue ", userpage: "GBE", up_url: up_url, active: false }
	];

	makeEditableGrid();

	makeVoGrid();

	function makeEditableGrid() {
		var mainlabel = $( '<h2>' ).html( "Editable/deltable grid, double click on field to edit" );
		$el.append( mainlabel );

		var editGrid = new OOJSPlus.ui.data.GridWidget( {
			deletable: true,
			pageSize: 10,
			columns: {
				firstName: {
					headerText: "First name",
					type: "text",
					editable: true
				},
				lastName: {
					headerText: "Last name",
					type: "text",
					editable: true
				},
				address: {
					headerText: "Address",
					type: "text",
					editable: true
				},
				userpage: {
					headerText: "User page",
					type: "url",
					urlProperty: "up_url"
				},
				active: {
					width: 30,
					headerText: "Active",
					type: "boolean",
					editable: true
				}

			},
			data: data
		} );
		$el.append( editGrid.$element );
	}


	function makeVoGrid() {
		var mainlabel = $( '<h2>' ).html( "View-only grid, all fields sortable, click \"Add more data\" to add more rows, pageSize: 10" );
		$el.append( mainlabel );

		var addDataBtn = new OO.ui.ButtonWidget( {
			label: "AddData"
		} );
		addDataBtn.on( 'click', function() {
			gridCfg.data = data.concat( addData );
			addDataBtn.setDisabled( true );
			drawvoGrid();
		} );
		var borderType = new OO.ui.DropdownInputWidget( {
			value: 'none',
			options: [
				{
					data: 'none',
					label: 'None'
				},
				{
					data: 'vertical',
					label: 'Vertical only'
				},
				{
					data: 'horizontal',
					label: 'Horizontal only'
				},
				{
					data: 'all',
					label: 'All'
				}
			]
		} );
		borderType.on( 'change', function( val ) {
			if( val ) {
				gridCfg.border = val;
			} else {
				gridCfg.border = 'none';
			}
			drawvoGrid();
		} );

		var diffRows = new OO.ui.CheckboxInputWidget( {
			selected: false
		} );
		diffRows.on( 'change', function( val ) {
			if( val ) {
				gridCfg.style = 'differentiate-rows';
			} else {
				delete( gridCfg.style );
			}
			drawvoGrid();
		} );

		var options = new OO.ui.HorizontalLayout( {
			items: [
				new OO.ui.FieldLayout( addDataBtn, {
					label: ' ',
					align: 'top'
				} ),
				new OO.ui.FieldLayout( borderType, {
					label: 'Border style',
					align: 'top'
				} ),
				new OO.ui.FieldLayout( diffRows, {
					label: 'Differentiate rows',
					align: 'top'
				} )
			]
		} );
		options.$element.children().css( 'vertical-align', 'middle' ).css( 'margin-left', "20px" );
		$el.append( options.$element );


		var gridCfg = {
			pageSize: 10,
			columns: {
				firstName: {
					headerText: "First name",
					type: "text"
				},
				lastName: {
					headerText: "Last name",
					type: "text"
				},
				address: {
					headerText: "Address",
					type: "text"
				},
				userpage: {
					headerText: "User page",
					type: "url",
					urlProperty: "up_url"
				},
				active: {
					width: 30,
					headerText: "Active",
					type: "boolean"
				}

			},
			data: data
		};

		drawvoGrid();

		function drawvoGrid() {
			$el.find( '.vo-Grid' ).remove();
			var voGrid = new OOJSPlus.ui.data.GridWidget( gridCfg );
			voGrid.$element.addClass( 'vo-Grid' );
			$el.append( voGrid.$element );
		}
	}



} )( mediaWiki, jQuery );