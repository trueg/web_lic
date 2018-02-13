/* global require: false, describe: false, it: false, before: false */

'use strict';
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;
const sinon = require('sinon');

const LDParse = require('../../src/LDParse');
const util = require('../../src/util');
const store = require('../../src/store');
const trivial_part_dict = require('../trivial_part_dict.json');

describe('Test state store module', function() {

	before(function() {
		sinon.stub(util, 'renderCSI').callsFake(() => {
			return {width: 200, height: 100};
		});
		sinon.stub(util, 'renderPLI').callsFake(() => {
			return {width: 50, height: 25};
		});
		sinon.stub(util, 'measureLabel').callsFake(() => {
			return {width: 10, height: 14};
		});
	});

	function resetState() {
		store.resetState();
		store.setModel(trivial_part_dict['trivial_model.ldr']);
		store.mutations.addTitlePage();
		store.mutations.addInitialPages(trivial_part_dict);
	}

	function verifyInitialState() {
		assert.isNull(store.state.titlePage);
		assert.isEmpty(store.state.pages);
		assert.isEmpty(store.state.steps);
		assert.isEmpty(store.state.csis);
		assert.isEmpty(store.state.plis);
		assert.isEmpty(store.state.pliItems);
		assert.isEmpty(store.state.pliQtys);
		assert.isEmpty(store.state.labels);
		assert.deepEqual(store.state.pageSize, {width: 900, height: 700});
		assert.equal(store.get.pageCount(), 0);
	}

	it('store exists with all public API', () => {
		assert.exists(store.state);
		assert.exists(store.replaceState);
		assert.exists(store.resetState);
		assert.exists(store.get);
		assert.exists(store.get.pageCount);
		assert.exists(store.get.modelName);
		assert.exists(store.get.modelFilename);
		assert.exists(store.get.modelFilenameBase);
		assert.exists(store.get.isTitlePage);
		assert.exists(store.get.isFirstPage);
		assert.exists(store.get.isLastPage);
		assert.exists(store.get.nextPage);
		assert.exists(store.get.prevPage);
		assert.exists(store.get.titlePage);
		assert.exists(store.get.firstPage);
		assert.exists(store.get.lastPage);
		assert.exists(store.get.parent);
		assert.exists(store.get.pageForItem);
		assert.exists(store.get.numberLabel);
		assert.exists(store.get.lookupToItem);
		assert.exists(store.get.itemToLookup);
		assert.exists(store.get.page);
		assert.exists(store.get.step);
		assert.exists(store.get.csi);
		assert.exists(store.get.pli);
		assert.exists(store.get.pliItem);
		assert.exists(store.get.pliQty);
		assert.exists(store.get.label);
		assert.exists(store.mutations);
		assert.exists(store.mutations.addStateItem);
		assert.exists(store.mutations.deleteItem);
		assert.exists(store.mutations.repositionItem);
		assert.exists(store.mutations.moveStepToPage);
		assert.exists(store.mutations.moveStepToPreviousPage);
		assert.exists(store.mutations.moveStepToNextPage);
		assert.exists(store.mutations.mergeSteps);
		assert.exists(store.mutations.deletePage);
		assert.exists(store.mutations.deleteStep);
		assert.exists(store.mutations.deletePLI);
		assert.exists(store.mutations.renumber);
		assert.exists(store.mutations.renumberSteps);
		assert.exists(store.mutations.renumberPages);
		assert.exists(store.mutations.setNumber);
		assert.exists(store.mutations.layoutStep);
		assert.exists(store.mutations.layoutPage);
		assert.exists(store.mutations.layoutTitlePage);
		assert.exists(store.mutations.addTitlePage);
		assert.exists(store.mutations.addInitialPages);
	});


	it('Initial state should be empty', () => {
		verifyInitialState();
	});

	it('Insert simple state items', () => {
		verifyInitialState();
		assert.deepEqual(store.mutations.addStateItem({type: 'page'}), {type: 'page', id: 0});
		assert.deepEqual(store.state.pages[0], {type: 'page', id: 0});
		assert.deepEqual(store.mutations.addStateItem({type: 'page'}), {type: 'page', id: 1});
		assert.deepEqual(store.mutations.addStateItem({type: 'page'}), {type: 'page', id: 2});
		assert.equal(store.state.pages.length, 3);
		assert.deepEqual(store.state.pages[1], {type: 'page', id: 1});
		assert.deepEqual(store.mutations.addStateItem({type: 'step'}), {type: 'step', id: 0});
		assert.deepEqual(store.state.steps[0], {type: 'step', id: 0});

		store.resetState();
		verifyInitialState();
		assert.isNull(store.mutations.addStateItem());
		verifyInitialState();
		assert.isNull(store.mutations.addStateItem({foo: 'page'}));
		verifyInitialState();
		assert.isNull(store.mutations.addStateItem({type: 'foo'}));
		verifyInitialState();
	});

	it('Replace and reset state', () => {
		store.replaceState({a: 10, b: 20});
		assert.deepEqual(store.state, {a: 10, b: 20});
		store.resetState();
		verifyInitialState();
	});

	const titlePageState = {type: 'titlePage', id: 0, steps: [0], labels: [0, 1]};
	const pageState = {type: 'page', id: 0, needsLayout: true, number: 1, numberLabel: 0, steps: [1]};
	const step0State = {
		type: 'step', id: 0, parent: {type: 'titlePage', id: 0},
		x: null, y: null, width: null, height: null, csiID: 0
	};
	const step1State = {
		type: 'step', id: 1, parent: {type: 'page', id: 0}, number: 1, numberLabel: 0,
		x: null, y: null, width: null, height: null, csiID: 1, parts: [0], pliID: 0, submodel: []
	};
	const csiState = {
		type: 'csi', id: 0, parent: {type: 'step', id: 0},
		x: null, y: null, width: null, height: null
	};
	const titleLabel = {
		type: 'label', id: 0, parent: {type: 'titlePage', id: 0}, text: '', color: 'black', font: '20pt Helvetica',
		x: null, y: null, width: null, height: null
	};
	it('Add a Title Page', () => {
		store.mutations.addTitlePage();
		assert.equal(store.state.pages.length, 0);
		assert.equal(store.state.steps.length, 1);
		assert.equal(store.state.csis.length, 1);
		assert.equal(store.state.plis.length, 0);
		assert.deepEqual(store.state.titlePage, titlePageState);
		assert.deepEqual(store.state.steps[0], step0State);
		assert.deepEqual(store.state.csis[0], csiState);
		assert.equal(store.get.pageCount(), 0);
		assert.isNull(store.get.nextPage(0));
		assert.isNull(store.get.prevPage(0));
		assert.deepEqual(store.get.parent(store.state.steps[0]), titlePageState);
		assert.deepEqual(store.get.parent(store.state.csis[0]), step0State);
		assert.deepEqual(store.get.pageForItem(store.state.steps[0]), titlePageState);
		assert.deepEqual(store.get.pageForItem(store.state.csis[0]), titlePageState);
		assert.equal(store.state.labels.length, 2);
		assert.deepEqual(store.state.labels[0], titleLabel);
	});

	it('Import trivial model', () => {
		store.resetState();
		store.setModel(trivial_part_dict['trivial_model.ldr']);
		store.mutations.addTitlePage();
		store.mutations.addInitialPages(trivial_part_dict);
		assert.equal(store.state.pages.length, 3);
		assert.deepEqual(store.state.titlePage, titlePageState);
		assert.deepEqual(store.state.pages[0], pageState);
		assert.equal(store.state.steps.length, 4);
		assert.deepEqual(store.state.steps[0], step0State);
		assert.deepEqual(store.state.steps[1], step1State);
		assert.equal(store.state.csis.length, 4);
		assert.deepEqual(store.state.csis[0], csiState);
		const newTitleLabel = util.clone(titleLabel);
		newTitleLabel.text = 'Trivial Model';
		assert.deepEqual(store.state.labels[0], newTitleLabel);
	});

	it('Verify page navigation', () => {
		assert.isTrue(store.get.isTitlePage(store.state.titlePage));
		assert.isFalse(store.get.isTitlePage());
		assert.isFalse(store.get.isTitlePage(null));
		assert.isFalse(store.get.isTitlePage({id: null}));
		assert.isFalse(store.get.isTitlePage(store.state.pages[0]));
		assert.isFalse(store.get.isTitlePage(store.state.pages[1]));

		assert.isTrue(store.get.isFirstPage(store.state.pages[0]));
		assert.isFalse(store.get.isFirstPage());
		assert.isFalse(store.get.isFirstPage(null));
		assert.isFalse(store.get.isFirstPage({id: null}));
		assert.isFalse(store.get.isFirstPage(store.state.pages[1]));

		assert.isTrue(store.get.isLastPage(store.state.pages[2]));
		assert.isFalse(store.get.isLastPage());
		assert.isFalse(store.get.isLastPage(null));
		assert.isFalse(store.get.isLastPage({id: null}));
		assert.isFalse(store.get.isLastPage(store.state.pages[0]));

		assert.equal(store.get.nextPage(store.state.titlePage), store.state.pages[0]);
		assert.equal(store.get.nextPage(store.state.pages[0]), store.state.pages[1]);
		assert.equal(store.get.nextPage(store.state.pages[2]), store.state.pages[3]);
		assert.isNull(store.get.nextPage(store.state.pages[3]));
		assert.isNull(store.get.nextPage());
		assert.isNull(store.get.nextPage(null));
		assert.isNull(store.get.nextPage({id: null}));

		assert.equal(store.get.prevPage(store.state.pages[0], true), store.state.titlePage);
		assert.isNull(store.get.prevPage(store.state.pages[0], false));
		assert.equal(store.get.prevPage(store.state.pages[1]), store.state.pages[0]);
		assert.equal(store.get.prevPage(store.state.pages[2]), store.state.pages[1]);
		assert.isNull(store.get.prevPage(store.state.titlePage));
		assert.isNull(store.get.prevPage());
		assert.isNull(store.get.prevPage(null));
		assert.isNull(store.get.prevPage({id: null}));

		assert.equal(store.get.titlePage(), store.state.titlePage);
		assert.equal(store.get.firstPage(), store.state.pages[0]);
		assert.equal(store.get.lastPage(), store.state.pages[2]);
	});

	it('Verify store.get lookup methods', () => {
		assert.equal(store.get.parent(store.state.steps[0]), store.state.titlePage);
		assert.equal(store.get.parent({type: 'step', id: 0}), store.state.titlePage);
		assert.equal(store.get.parent(store.state.csis[0]), store.state.steps[0]);
		assert.equal(store.get.parent({type: 'csi', id: 0}), store.state.steps[0]);
		assert.isNull(store.get.parent());
		assert.isNull(store.get.parent(null));
		assert.isNull(store.get.parent({id: null}));
		assert.isNull(store.get.parent({id: 0, parent: null}));
		assert.isNull(store.get.parent({id: 0, parent: {id: 0, type: null}}));

		assert.equal(store.get.pageForItem(store.state.steps[0]), store.state.titlePage);
		assert.equal(store.get.pageForItem({type: 'step', id: 0}), store.state.titlePage);
		assert.equal(store.get.pageForItem(store.state.plis[2]), store.state.pages[2]);
		assert.equal(store.get.pageForItem({type: 'pli', id: 2}), store.state.pages[2]);
		assert.isNull(store.get.pageForItem());
		assert.isNull(store.get.pageForItem(null));
		assert.isNull(store.get.pageForItem({type: 'step', id: null}));
		assert.isNull(store.get.pageForItem({type: 'foo', id: 0}));

		assert.equal(store.get.numberLabel(store.state.pages[0]), store.state.pageNumbers[0]);
		assert.equal(store.get.numberLabel({type: 'page', id: 0}), store.state.pageNumbers[0]);
		assert.equal(store.get.numberLabel(store.state.steps[1]), store.state.stepNumbers[0]);
		assert.equal(store.get.numberLabel({type: 'step', id: 1}), store.state.stepNumbers[0]);
		assert.isNull(store.get.numberLabel());
		assert.isNull(store.get.numberLabel(null));
		assert.isNull(store.get.numberLabel({type: 'step', id: null}));
		assert.isNull(store.get.numberLabel({type: 'foo', id: 0}));
		assert.isNull(store.get.numberLabel({type: 'titlePage', id: 0}));

		assert.equal(store.get.lookupToItem({type: 'page', id: 0}), store.state.pages[0]);
		assert.equal(store.get.lookupToItem({type: 'step', id: 0}), store.state.steps[0]);
		assert.isNull(store.get.lookupToItem());
		assert.isNull(store.get.lookupToItem(null));
		assert.isNull(store.get.lookupToItem({type: 'page', id: null}));
		assert.isNull(store.get.lookupToItem({type: 'foo', id: 0}));

		assert.deepEqual(store.get.itemToLookup(store.state.pages[0]), {type: 'page', id: 0});
		assert.deepEqual(store.get.itemToLookup(store.state.steps[1]), {type: 'step', id: 1});
		assert.deepEqual(store.get.itemToLookup(store.state.labels[0]), {type: 'label', id: 0});
		assert.isNull(store.get.itemToLookup());
		assert.isNull(store.get.itemToLookup({}));
		assert.isNull(store.get.itemToLookup({type: 'foo', id: 0}));
	});

	it('Verify store item lookups', () => {
		assert.deepEqual(store.get.page(0), store.state.pages[0]);
		assert.deepEqual(store.get.page(2), store.state.pages[2]);
		assert.deepEqual(store.get.page({type: 'page', id: 0}), store.state.pages[0]);
		assert.isNull(store.get.page({type: 'foo', id: 0}));
		assert.isNull(store.get.page(10));

		assert.deepEqual(store.get.step(0), store.state.steps[0]);
		assert.deepEqual(store.get.step(3), store.state.steps[3]);
		assert.deepEqual(store.get.step({type: 'step', id: 0}), store.state.steps[0]);

		assert.deepEqual(store.get.csi(0), store.state.csis[0]);
		assert.deepEqual(store.get.csi(2), store.state.csis[2]);
		assert.deepEqual(store.get.csi({type: 'csi', id: 0}), store.state.csis[0]);

		assert.deepEqual(store.get.pli(1), store.state.plis[1]);
		assert.deepEqual(store.get.pliQty(0), store.state.pliQtys[0]);
		assert.deepEqual(store.get.label(0), store.state.labels[0]);
		assert.deepEqual(store.get.pageNumber(0), store.state.pageNumbers[0]);
		assert.deepEqual(store.get.stepNumber(0), store.state.stepNumbers[0]);
	});

	describe('Move step to page', () => {

		it('Move Step to previous page', () => {
			resetState();
			const step = {type: 'step', id: 2};
			assert.equal(store.get.parent(step).id, 1);
			assert.equal(store.get.lookupToItem(step).id, 2);
			store.mutations.moveStepToPreviousPage(step);
			assert.equal(store.state.steps[2].parent.id, 0);
			assert.deepEqual(store.get.step(step).parent, {type: 'page', id: 0});
			assert.deepEqual(store.state.pages[0].steps, [1, 2]);
			assert.equal(store.state.pages[1].steps.length, 0);
		});

		it('Move Step back to next page', () => {
			const step = {type: 'step', id: 2};
			store.mutations.moveStepToNextPage(step);
			assert.deepEqual(store.state.pages[0].steps, [1]);
			assert.deepEqual(store.state.pages[1].steps, [2]);
			assert.equal(store.state.steps[2].parent.id, 1);
		});

		it('Should not move first step to previous page', () => {
			store.mutations.moveStepToPreviousPage({type: 'step', id: 1});
			assert.equal(store.state.steps[1].parent.id, 0);
			assert.equal(store.state.pages[0].steps[0], 1);
		});

		it('Should not move last step anywhere', () => {
			store.mutations.moveStepToNextPage({type: 'step', id: 3});
			assert.equal(store.state.steps[3].parent.id, 2);
			assert.equal(store.state.pages[2].steps[0], 3);
		});
	});

	describe('Delete blank page', () => {

		it('Should not delete page with steps', () => {
			resetState();
			store.mutations.deletePage({type: 'page', id: 2});
			assert.equal(store.state.pages.length, 3);
			assert.equal(store.state.pages[2].id, 2);
			assert.equal(store.state.pages[2].steps.length, 1);
		});

		it('Delete empty page', () => {
			store.mutations.moveStepToPreviousPage({type: 'step', id: 2});
			assert.equal(store.state.pages[0].steps.length, 2);
			assert.isEmpty(store.state.pages[1].steps);
			assert.equal(store.state.steps[2].parent.id, 0);

			store.mutations.deletePage({type: 'page', id: 1});
			assert.equal(store.state.pages.length, 2);
			assert.equal(store.state.pageNumbers.length, 2);
			assert.deepEqual(store.state.pageNumbers.map(el => el.id), [0, 2]);
			assert.isFalse(store.get.isLastPage({type: 'titlePage', id: 0}));
			assert.equal(store.get.numberLabel(store.state.pages[1]), store.state.pageNumbers[1]);
		});

		it('Delete another page', () => {
			store.mutations.deletePage({type: 'page', id: 2});
			assert.equal(store.state.pages[1].steps.length, 1);
			store.mutations.moveStepToPreviousPage({type: 'step', id: 3});
			assert.equal(store.state.pages[1].steps.length, 0);
			store.mutations.deletePage({type: 'page', id: 2});
			assert.equal(store.state.pages.length, 1);
			assert.isFalse(store.get.isLastPage({type: 'titlePage', id: 0}));
			assert.equal(store.get.numberLabel(store.state.pages[0]), store.state.pageNumbers[0]);
		});
	});

	it('Move all steps to 1 page', () => {
//		store.mutations.moveStepToPreviousPage({type: 'step', id: 3});
	});
});
