<?php

namespace OOJSPlus\Special;

abstract class OOJSTreeSpecialPage extends OOJSSpecialPage {

	/**
	 * @inheritDoc
	 */
	public function getTemplateName() {
		return 'tree-skeleton';
	}
}
