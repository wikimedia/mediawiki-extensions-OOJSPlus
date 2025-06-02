<?php

namespace OOJSPlus\Special;

abstract class OOJSCardSpecialPage extends OOJSSpecialPage {

	/**
	 * @inheritDoc
	 */
	public function getTemplateName() {
		return 'card-skeleton';
	}
}
